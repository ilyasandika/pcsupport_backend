import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { UserForLogin } from '../../common/types/user-login.type';
import { plainToInstance } from 'class-transformer';
import { DetailUserResponseDto } from './dto/user-response.dto';
import { Role } from '../../common/enums/role.enum';
import { ErrorDetailBuilder } from '../../common/utils/error-detail-builder';
import { extname, join } from 'path';
import { SIGNATURE_UPLOAD_DIR } from '../../common/const/directory.const';
import { rename, unlink } from 'node:fs/promises';
import * as fs from 'fs';
import * as XLSX from 'xlsx';
import { RawUserExcelRow } from '../../common/interfaces/raw-user-excel.interface';

import { Ticket } from '../tickets/entities/ticket.entity';
import { TicketStatus } from '../../common/enums/ticket-status.enum';
import { LlmService } from '../../common/llm/llm.service';
import { Between, In } from 'typeorm';
import { SyncUserTagsDto } from './dto/sync-user-tags.dto';
import dayjs from 'dayjs';
import {
  TagHistoryItem,
  ReviewHistoryItem,
} from './interfaces/user-ai-history.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    private readonly llmService: LlmService,
  ) {}

  async create(dto: CreateUserDto) {
    const { username, email } = dto;

    const existingUser = await this.userRepository.findOne({
      where: [{ username }, { email }],
      select: ['username', 'email'],
    });

    if (existingUser) {
      if (existingUser.username === username && existingUser.email === email) {
        throw new ConflictException('username and email already taken');
      }
      if (existingUser.username === username) {
        throw new ConflictException('username already taken');
      }
      if (existingUser.email === email) {
        throw new ConflictException('email already taken');
      }
    }

    const salt = parseInt(process.env.SALT || '10');
    dto.password = await bcrypt.hash(dto.password, salt);

    const newUser = this.userRepository.create(dto);
    return await this.userRepository.save(newUser);
  }

  async findAll() {
    const { entities, raw } = await this.userRepository
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.workLocation', 'workLocation')
      .addSelect(
        `(EXISTS (
          SELECT 1 FROM tickets t 
          WHERE t.engineer_id = users.id OR t.created_by_user_id = users.id
        ))`,
        'has_ticket',
      )
      .addSelect(
        `CASE users.role
          WHEN '${Role.Admin}' THEN 1
          WHEN '${Role.Supervisor}' THEN 2
          WHEN '${Role.Helpdesk}' THEN 3
          WHEN '${Role.Engineer}' THEN 4
          ELSE 5
        END`,
        'role_priority',
      )
      .orderBy('role_priority', 'ASC')
      .getRawAndEntities();

    const usersWithFlag = entities.map((user, index) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      const rawVal = raw[index]?.has_ticket;
      const isUserHasTicket =
        rawVal === true || rawVal === '1' || rawVal === 1 || rawVal === 'true';

      return {
        ...user,
        isUserHasTicket,
      };
    });

    return plainToInstance(DetailUserResponseDto, usersWithFlag);
  }

  async findEngineers() {
    const engineers = await this.userRepository.find({
      where: {
        role: Role.Engineer,
      },
      relations: {
        workLocation: true,
      },
    });

    return plainToInstance(DetailUserResponseDto, engineers);
  }

  async findSupervisors() {
    const supervisors = await this.userRepository.find({
      where: {
        role: Role.Supervisor,
      },
      relations: {
        workLocation: true,
      },
    });

    return plainToInstance(DetailUserResponseDto, supervisors);
  }

  async findFallBackSupervisorByLocation(locationId: number) {
    let supervisor = await this.userRepository.findOne({
      where: {
        role: Role.Supervisor,
        workLocationId: locationId,
        active: true,
      },
    });

    if (!supervisor) {
      supervisor = await this.userRepository.findOne({
        where: {
          role: Role.Supervisor,
          active: true,
        },
      });
    }

    return plainToInstance(DetailUserResponseDto, supervisor);
  }

  async findActiveUser(id: number) {
    return await this.userRepository.findOne({
      where: { id },
      select: ['id', 'username', 'fullName', 'role', 'active'],
    });
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: {
        tickets: {
          engineer: true,
          employee: true,
        },
        workLocation: true,
      },
      order: {
        tickets: {
          createdAt: 'DESC',
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`user does not exist`);
    }

    const isUserHasTicket = Boolean(user.tickets && user.tickets.length > 0);

    return plainToInstance(DetailUserResponseDto, {
      ...user,
      isUserHasTicket,
    });
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.findOrThrow(id);
    this.userRepository.merge(user, dto);
    return await this.userRepository.save(user);
  }

  async toggleStatus(id: number) {
    const user = await this.findOrThrow(id);
    user.active = !user.active;
    const updatedUser = await this.userRepository.save(user);
    return plainToInstance(DetailUserResponseDto, updatedUser);
  }

  async setActiveStatus(id: number, active: boolean) {
    const user = await this.findOrThrow(id);
    user.active = active;
    const updatedUser = await this.userRepository.save(user);
    return plainToInstance(DetailUserResponseDto, updatedUser);
  }

  async activateUser(id: number) {
    return await this.setActiveStatus(id, true);
  }

  async deactivateUser(id: number) {
    return await this.setActiveStatus(id, false);
  }

  async updatePassword(id: number, dto: UpdateUserPasswordDto) {
    const user = await this.userRepository.findOne({
      where: [{ id }],
      select: ['password'],
    });
    if (!user) {
      throw new NotFoundException(`user does not exist`);
    }

    const isMatch = await bcrypt.compare(dto.oldPassword, user.password);

    if (!isMatch) {
      throw new BadRequestException(
        ErrorDetailBuilder.buildOne(['incorrect old password'], 'oldPassword'),
      );
    }

    const hashedPassword = await bcrypt.hash(
      dto.newPassword,
      parseInt(process.env.SALT || '10'),
    );
    return await this.userRepository.update(id, { password: hashedPassword });
  }

  async remove(id: number) {
    const user = await this.findOrThrow(id);
    user.email = `${user.email}-deleted-${new Date().getTime()}`;
    user.username = `${user.username}-deleted-${new Date().getTime()}`;
    await this.userRepository.softDelete(id);
  }

  async findForLogin(username: string): Promise<UserForLogin> {
    const user = await this.userRepository.findOne({
      where: [{ username }],
      select: [
        'id',
        'username',
        'email',
        'password',
        'role',
        'fullName',
        'active',
      ],
    });
    if (!user) {
      return null;
    }
    return user;
  }

  private async findOrThrow(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`user does not exist`);
    }

    return user;
  }

  async uploadTemplate(id: number, file: Express.Multer.File) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      await this.deleteFileIfExists(file.path);
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const newFilename = `signature-${user.username}-${Date.now()}${extname(file.originalname)}`;
    const newPath = join(SIGNATURE_UPLOAD_DIR, newFilename);

    const oldSignaturePath = user.signaturePath;

    try {
      await rename(file.path, newPath);

      user.signaturePath = newPath;
      const updatedUser = await this.userRepository.save(user);

      if (oldSignaturePath && oldSignaturePath !== newPath) {
        await this.deleteFileIfExists(oldSignaturePath);
      }

      return updatedUser;
    } catch {
      await this.deleteFileIfExists(newPath);
      await this.deleteFileIfExists(file.path);

      throw new InternalServerErrorException(
        'Failed to upload signature, please try again later',
      );
    }
  }

  async getSignatureStream(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user || !user.signaturePath) {
      throw new NotFoundException(`Signature for user with ID ${id} not found`);
    }
    if (!fs.existsSync(user.signaturePath)) {
      throw new NotFoundException(`Signature file not found on disk`);
    }
    return fs.createReadStream(user.signaturePath);
  }

  async deleteSignature(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user || !user.signaturePath) {
      throw new NotFoundException(`Signature for user with ID ${id} not found`);
    }

    await this.deleteFileIfExists(user.signaturePath);

    user.signaturePath = undefined;
    await this.userRepository.save(user);
    return { message: 'Signature deleted successfully' };
  }

  private async deleteFileIfExists(filePath: string): Promise<void> {
    try {
      await unlink(filePath);
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }
  }

  async parseExcel(buffer: Buffer) {
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const records: any[] = XLSX.utils.sheet_to_json(worksheet, {
      raw: false,
      defval: '',
    });
    const salt = parseInt(process.env.SALT || '10');
    const mappedData: CreateUserDto[] = await Promise.all(
      records.map(async (row: RawUserExcelRow) => {
        const hashedPassword = await bcrypt.hash(row['password'], salt);

        return {
          fullName: row['full_name'],
          username: row['username'],
          password: hashedPassword,
          email: row['email'],
          nik: row['nik'] ?? undefined,
          role: row['role'],
          workLocationId: row['work_location_id'],
        };
      }),
    );

    return await this.bulkSaveUsers(mappedData);
  }

  private async bulkSaveUsers(dto: CreateUserDto[]) {
    return await this.userRepository.upsert(dto, {
      conflictPaths: ['username'],
      skipUpdateIfNoValuesChanged: true,
      upsertType: 'on-conflict-do-update',
    });
  }

  async syncUserTags(id: number, dto?: SyncUserTagsDto) {
    const user = await this.findOrThrow(id);

    let periodLabel: string | undefined = undefined;
    let dateFilter: any = undefined;

    if (dto?.period) {
      const parsed = dayjs(dto.period, ['YYYY-MM', 'YYYY-M']);
      if (parsed.isValid()) {
        const start = parsed.startOf('month').toDate();
        const end = parsed.endOf('month').toDate();
        dateFilter = Between(start, end);
        periodLabel = parsed.format('MMMM YYYY');
      }
    } else if (dto?.year && dto?.month) {
      const parsed = dayjs(`${dto.year}-${dto.month}`, 'YYYY-M');
      if (parsed.isValid()) {
        const start = parsed.startOf('month').toDate();
        const end = parsed.endOf('month').toDate();
        dateFilter = Between(start, end);
        periodLabel = parsed.format('MMMM YYYY');
      }
    }

    const whereResolved: FindOptionsWhere<Ticket> = {
      engineerId: id,
      status: In([
        TicketStatus.Resolved,
        TicketStatus.ClosedRemote,
        TicketStatus.ClosedVisit,
        TicketStatus.ClosedOnsite,
      ]),
    };

    const whereFallback: FindOptionsWhere<Ticket> = {
      engineerId: id,
    };

    if (dateFilter) {
      whereResolved.createdAt = dateFilter as Date;
      whereFallback.createdAt = dateFilter as Date;
    }

    const tickets = await this.ticketRepository.find({
      where: whereResolved,
      relations: {
        asset: {
          category: true,
        },
        slaPolicy: true,
      },
      order: {
        solvedAt: 'DESC',
        createdAt: 'DESC',
      },
      take: dateFilter ? undefined : 100,
    });

    const ticketList =
      tickets.length > 0
        ? tickets
        : await this.ticketRepository.find({
            where: whereFallback,
            relations: {
              asset: {
                category: true,
              },
              slaPolicy: true,
            },
            order: { createdAt: 'DESC' },
            take: dateFilter ? 100 : 30,
          });

    if (ticketList.length === 0) {
      throw new BadRequestException(
        dateFilter
          ? `Tidak ada riwayat tiket untuk engineer pada periode ${periodLabel || 'tersebut'}.`
          : 'User does not have any ticket history to analyze tags.',
      );
    }

    const payload = ticketList.map((t) => {
      let remainingSlaRatio: number | null = null;
      if (t.slaPolicy && Number(t.slaPolicy.resolutionTimeSeconds) > 0) {
        const startTime = t.startAt
          ? new Date(t.startAt).getTime()
          : new Date(t.createdAt).getTime();
        const endTime = t.solvedAt
          ? new Date(t.solvedAt).getTime()
          : new Date(t.updatedAt).getTime();

        if (startTime && endTime && endTime >= startTime) {
          const actualDurationSeconds = (endTime - startTime) / 1000;
          const targetResolutionSeconds = Number(
            t.slaPolicy.resolutionTimeSeconds,
          );
          const ratio =
            (targetResolutionSeconds - actualDurationSeconds) /
            targetResolutionSeconds;
          remainingSlaRatio = Number(ratio.toFixed(2));
        }
      }

      return {
        ticketNumber: t.fullNumber,
        problem: t.problem,
        category: t.asset?.category?.name || '',
        solution: t.solution || t.remarks || '',
        remarks: t.remarks || '',
        status: t.status,
        slaRemainingRatio: remainingSlaRatio,
      };
    });

    const analysis = await this.llmService.generateEngineerAnalysis(
      id,
      JSON.stringify(payload, null, 2),
      periodLabel,
    );

    const periodKey = dto?.period
      ? dto.period
      : dto?.year && dto?.month
        ? `${dto.year}-${String(dto.month).padStart(2, '0')}`
        : 'all-time';

    const nowIso = new Date().toISOString();

    const currentTagHistory: TagHistoryItem[] = user.tagHistory || [];
    const existingTagIdx = currentTagHistory.findIndex(
      (item) => item.period === periodKey,
    );
    const newTagItem: TagHistoryItem = {
      period: periodKey,
      periodLabel: periodLabel || 'Semua Waktu',
      tags: analysis.tags,
      updatedAt: nowIso,
    };

    if (existingTagIdx >= 0) {
      currentTagHistory[existingTagIdx] = newTagItem;
    } else {
      currentTagHistory.unshift(newTagItem);
    }

    const currentReviewHistory: ReviewHistoryItem[] = user.reviewHistory || [];
    const existingReviewIdx = currentReviewHistory.findIndex(
      (item) => item.period === periodKey,
    );
    const newReviewItem: ReviewHistoryItem = {
      period: periodKey,
      periodLabel: periodLabel || 'Semua Waktu',
      review: analysis.review,
      updatedAt: nowIso,
    };

    if (existingReviewIdx >= 0) {
      currentReviewHistory[existingReviewIdx] = newReviewItem;
    } else {
      currentReviewHistory.unshift(newReviewItem);
    }

    user.tags = analysis.tags;
    user.review = analysis.review;
    user.tagHistory = currentTagHistory;
    user.reviewHistory = currentReviewHistory;
    user.tagsUpdatedAt = new Date();
    const updatedUser = await this.userRepository.save(user);
    Logger.log(newReviewItem, 'User AI Review History');

    return plainToInstance(DetailUserResponseDto, updatedUser);
  }
}
