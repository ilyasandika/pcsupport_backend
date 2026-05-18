import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateAssetAssignmentDto } from './dto/create-asset_assignment.dto';
import { UpdateAssetAssignmentDto } from './dto/update-asset_assignment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AssetAssignment } from './entities/asset_assignment.entity';
import { IsNull, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { EmployeesService } from '../employees/employees.service';
import { AssetsService } from '../assets/assets.service';
import { ErrorDetailBuilder } from '../../common/utils/error-detail-builder';
import { ErrorResponseBuilder } from '../../common/utils/error-response-builder';

@Injectable()
export class AssetAssignmentsService {
  constructor(
    @InjectRepository(AssetAssignment)
    private readonly assetAssignmentRepository: Repository<AssetAssignment>,
    private readonly employeeService: EmployeesService,
    private readonly assetService: AssetsService,
  ) {}

  async create(dto: CreateAssetAssignmentDto) {

    const newAssignDate = new Date(dto.assignedAt);

    const overlappingAssignment = await this.assetAssignmentRepository.findOne({
      where: {
        assignedAt: LessThanOrEqual(newAssignDate),
        assetId: dto.assetId,
        returnedAt: MoreThanOrEqual(newAssignDate),
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
    if (!dto.isLegacyData) {
      const isUse = await this.assetAssignmentRepository.findOne({
        where: {
          assetId: dto.assetId,
          returnedAt: IsNull(),
        },
      });

      if (isUse) {
        throw new BadRequestException(
          ErrorDetailBuilder.buildOne('asset is currently use', 'assetId'),
        );
      }
    }

    const employee = await this.employeeService.findOne(dto.picEmployeeId);
    if (!employee) throw new NotFoundException('employee not found');
    const asset = await this.assetService.findOne(dto.assetId);
    if (!asset) throw new NotFoundException('asset not found');
    const assignment = this.assetAssignmentRepository.create(dto);
    return await this.assetAssignmentRepository.save(assignment);
  }

  async findLatestByAssetId(assetId: number) {
    return await this.assetAssignmentRepository.findOne({
      where: {
        assetId,
      },
      order: {
        assignedAt: 'DESC',
      },
    });
  }

  async findLatestByEmployeeId(employeeId: number) {
    return await this.assetAssignmentRepository.findOne({
      where: [{ picEmployeeId: employeeId }, { userEmployeeId: employeeId }],
      order: {
        assignedAt: 'DESC',
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} assetAssignment`;
  }

  update(id: number, updateAssetAssignmentDto: UpdateAssetAssignmentDto) {
    return `This action updates a #${id} assetAssignment`;
  }

  remove(id: number) {
    return `This action removes a #${id} assetAssignment`;
  }
}
