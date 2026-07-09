import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAssetAssignmentDto } from './dto/create-asset_assignment.dto';
import { UpdateAssetAssignmentDto } from './dto/update-asset_assignment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AssetAssignment } from './entities/asset_assignment.entity';
import {
  EntityManager,
  IsNull,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { EmployeesService } from '../employees/employees.service';
import { AssetsService } from '../assets/assets.service';
import { ErrorDetailBuilder } from '../../common/utils/error-detail-builder';

@Injectable()
export class AssetAssignmentsService {
  constructor(
    @InjectRepository(AssetAssignment)
    private readonly assetAssignmentRepository: Repository<AssetAssignment>,
    private readonly employeeService: EmployeesService,
    private readonly assetService: AssetsService,
  ) {}

  async create(dto: CreateAssetAssignmentDto) {
    const lastUse = await this.assetAssignmentRepository.findOne({
      where: {
        assetSn: dto.assetSn,
        returnedAt: IsNull(),
      },
    });

    if (lastUse) {
      if (new Date(dto.assignedAt) > new Date(lastUse?.assignedAt)) {
        throw new BadRequestException(
          ErrorDetailBuilder.buildOne(
            'assign date cannot overlap current assignment date',
            'assignedAt',
          ),
        );
      }
    }

    if (!dto.isLegacyData && lastUse) {
      throw new BadRequestException(
        ErrorDetailBuilder.buildOne('asset is currently use', 'assetId'),
      );
    }

    // A <= D && B>=C
    // A = Assign Baru
    // D = Return Lama
    // B = Return Baru
    // C = Assign Lama
    const overlappingAssignment = await this.assetAssignmentRepository.findOne({
      where: {
        assetSn: dto.assetSn,
        assignedAt: LessThanOrEqual(
          dto.returnedAt ? new Date(dto.returnedAt) : new Date('9999-12-31'),
        ),
        returnedAt: MoreThanOrEqual(new Date(dto.assignedAt)),
      },
    });
    if (overlappingAssignment) {
      throw new BadRequestException(
        ErrorDetailBuilder.buildOne(
          `Assignment timeline overlap detected. During this period, the asset is already actively assigned to another user.`,
          'assignedAt',
        ),
      );
    }

    const employee = await this.employeeService.findOne(dto.picEmployeeNik);
    if (!employee) throw new NotFoundException('employee not found');
    const asset = await this.assetService.findOne(dto.assetSn);
    if (!asset) throw new NotFoundException('asset not found');
    const assignment = this.assetAssignmentRepository.create(dto);
    return await this.assetAssignmentRepository.save(assignment);
  }

  async findAllByAssetSn(assetSn: string) {
    return await this.assetAssignmentRepository.find({
      where: {
        assetSn,
      },
      order: {
        assignedAt: 'DESC',
      },
      relations: {
        employee: true,
        asset: true,
      },
    });
  }

  async findAllByEmployeeNik(employeeNik: string) {
    return await this.assetAssignmentRepository.find({
      where: { picEmployeeNik: employeeNik },
      order: {
        assignedAt: 'DESC',
      },
      relations: {
        employee: true,
        asset: true,
      },
    });
  }

  async findLatestByAssetSn(assetSn: string, manager?: EntityManager) {
    try {
      const repo = manager
        ? manager.getRepository(AssetAssignment)
        : this.assetAssignmentRepository;
      return await repo.findOneOrFail({
        where: { assetSn },
        order: {
          assignedAt: 'DESC',
        },
      });
    } catch {
      throw new NotFoundException('assignment not fount');
    }
  }

  async findOne(id: number) {
    try {
      return await this.assetAssignmentRepository.findOneByOrFail({ id });
    } catch {
      throw new NotFoundException('assignment not found');
    }
  }

  async update(id: number, dto: UpdateAssetAssignmentDto) {
    const assignment = await this.assetAssignmentRepository.findOneBy({ id });
    if (!assignment) {
      throw new NotFoundException('assignment not found');
    }
    this.assetAssignmentRepository.merge(assignment, dto);
    return await this.assetAssignmentRepository.save(assignment);
  }

  async remove(id: number) {
    const assignment = await this.assetAssignmentRepository.findOneBy({ id });
    if (!assignment) {
      throw new NotFoundException('assignment not found');
    }
    return await this.assetAssignmentRepository.remove(assignment);
  }
}
