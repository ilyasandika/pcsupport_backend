import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
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
import * as XLSX from 'xlsx';
import { RawUserExcelRow } from '../../common/interfaces/raw-user-excel.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
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
    const users = await this.userRepository.find({
      relations: {
        workLocation: true,
      },
    });
    return plainToInstance(DetailUserResponseDto, users);
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
    const engineers = await this.userRepository.find({
      where: {
        role: Role.Supervisor,
      },
      relations: {
        workLocation: true,
      },
    });

    return plainToInstance(DetailUserResponseDto, engineers);
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

    return plainToInstance(DetailUserResponseDto, user);
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.findOrThrow(id);
    this.userRepository.merge(user, dto);
    return await this.userRepository.save(user);
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
      select: ['id', 'username', 'email', 'password', 'role', 'fullName'],
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
}
