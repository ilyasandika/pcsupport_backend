import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Asset, AssetStatus, SupportDetail } from './entities/asset.entity';
import {
  Brackets,
  EntityManager,
  FindOneOptions,
  IsNull,
  Repository,
} from 'typeorm';
import { ErrorDetailBuilder } from '../../common/utils/error-detail-builder';
import { plainToInstance } from 'class-transformer';
import {
  AssetResponseDto,
  DetailAssetResponseDto,
} from './dto/asset-response.dto';
import { AssetQueryDto } from './dto/asset-query.dto';
import * as XLSX from 'xlsx';
import { RawAssetExcelRow } from '../../common/interfaces/raw-asset-excel.interface';
import { AssetAssignment } from '../asset_assignments/entities/asset_assignment.entity';
import { Ticket } from '../tickets/entities/ticket.entity';
import { paginateQb } from '../../common/utils/paginate.util';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

import { AssetCategoriesService } from '../asset_categories/asset_categories.service';
import { WorkLocationsService } from '../work-locations/work-locations.service';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,

    @InjectRepository(AssetAssignment)
    private readonly assetAssignmentRepository: Repository<AssetAssignment>,

    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,

    private readonly assetCategoryService: AssetCategoriesService,
    private readonly workLocationsService: WorkLocationsService,
  ) {}

  async create(dto: CreateAssetDto) {
    const serialNumberExist = await this.assetRepository.findOneBy({
      serialNumber: dto.serialNumber,
    });
    const assetTagExist = await this.assetRepository.findOneBy({
      assetTag: dto.assetTag,
    });

    if (assetTagExist && serialNumberExist) {
      throw new ConflictException(
        ErrorDetailBuilder.buildMany([
          { field: 'assetTag', message: 'Asset Tag already exist' },
          { field: 'serialNumber', message: 'Serial Number already exist' },
        ]),
      );
    } else if (assetTagExist) {
      throw new ConflictException(
        ErrorDetailBuilder.buildOne('Asset Tag already exist', 'assetTag'),
      );
    } else if (serialNumberExist) {
      throw new ConflictException(
        ErrorDetailBuilder.buildOne(
          'Serial Number already exist',
          'serialNumber',
        ),
      );
    }
    const asset = this.assetRepository.create(dto);
    return await this.assetRepository.save(asset);
  }

  async findAll(
    query: AssetQueryDto,
    isList: boolean = false,
  ): Promise<PaginatedResponseDto<AssetResponseDto>> {
    const qb = this.assetRepository
      .createQueryBuilder('asset')
      .leftJoinAndSelect('asset.category', 'category')
      .leftJoinAndSelect('asset.workLocation', 'workLocation')
      .leftJoinAndSelect('asset.project', 'project')
      .leftJoinAndSelect('project.vendor', 'vendor');

    // --- search asset by tag or sn (combined) ---
    if (query.asset) {
      qb.andWhere(
        new Brackets((subQb) => {
          subQb
            .where('asset.assetTag ILike :asset', { asset: `%${query.asset}%` })
            .orWhere('asset.serialNumber ILike :asset', {
              asset: `%${query.asset}%`,
            });
        }),
      );
    } else {
      if (query.assetTag) {
        qb.andWhere('asset.assetTag ILike :assetTag', {
          assetTag: `%${query.assetTag}%`,
        });
      }
      if (query.assetSn) {
        qb.andWhere('asset.serialNumber ILike :assetSn', {
          assetSn: `%${query.assetSn}%`,
        });
      }
    }

    if (query.hostname) {
      qb.andWhere('asset.hostname ILike :hostname', {
        hostname: `%${query.hostname}%`,
      });
    }

    // --- search employee by name or nik (combined) ---
    // pakai EXISTS subquery, BUKAN join, supaya asset tidak kegandaan
    // (assetAssignments = one-to-many) dan pagination tetap akurat
    if (query.employee) {
      qb.andWhere(
        `EXISTS (
                SELECT 1
                FROM asset_assignments aa
                LEFT JOIN employees emp ON emp.nik = aa.pic_employee_nik
                WHERE aa.asset_tag = asset.asset_tag
                  AND aa.assigned_at = (
                    SELECT MAX(aa2.assigned_at)
                    FROM asset_assignments aa2
                    WHERE aa2.asset_tag = asset.asset_tag
                  )
                  AND (
                    emp.nik ILIKE :employee
                    OR emp.name ILIKE :employee
                    OR aa.user_non_employee_name ILIKE :employee
                  )
              )`,
        { employee: `%${query.employee}%` },
      );
    } else {
      if (query.employeeNik || query.employeeName) {
        qb.andWhere(
          `EXISTS (
          SELECT 1 FROM asset_assignment aa
          LEFT JOIN employee emp ON emp.id = aa."employeeId"
          WHERE aa."assetTag" = asset."assetTag"
            ${query.employeeNik ? 'AND emp.nik ILike :employeeNik' : ''}
            ${query.employeeName ? 'AND emp.name ILike :employeeName' : ''}
        )`,
          {
            ...(query.employeeNik && {
              employeeNik: `%${query.employeeNik}%`,
            }),
            ...(query.employeeName && {
              employeeName: `%${query.employeeName}%`,
            }),
          },
        );
      }
    }

    if (query.category && query.category.length > 0) {
      qb.andWhere('category.name IN (:...category)', {
        category: query.category,
      });
    }

    if (query.type) {
      qb.andWhere('asset.type ILike :type', { type: `%${query.type}%` });
    }

    // --- search vendor or project (combined) ---
    if (query.vendorProject) {
      qb.andWhere(
        new Brackets((subQb) => {
          subQb
            .where('vendor.name ILike :vendorProject', {
              vendorProject: `%${query.vendorProject}%`,
            })
            .orWhere('project.name ILike :vendorProject', {
              vendorProject: `%${query.vendorProject}%`,
            });
        }),
      );
    } else {
      if (query.vendor) {
        qb.andWhere('vendor.name ILike :vendor', {
          vendor: `%${query.vendor}%`,
        });
      }
      if (query.project) {
        qb.andWhere('project.name ILike :project', {
          project: `%${query.project}%`,
        });
      }
    }

    if (query.status && query.status.length > 0) {
      qb.andWhere('asset.status IN (:...status)', { status: query.status });
    }

    qb.addSelect(
      `CASE asset.status
        WHEN 'assigned' THEN 1
        WHEN 'assigned for backup' THEN 2
        WHEN 'undeployed' THEN 3
        WHEN 'pending bast' THEN 4
        WHEN 'ready stock' THEN 5
        WHEN 'damaged' THEN 6
        WHEN 'offline' THEN 7
        WHEN 'returned' THEN 8
        WHEN 'missing' THEN 9
        WHEN 'backup' THEN 10
        WHEN 'unknown' THEN 11
        ELSE 12
    END`,
      'status_order',
    );

    qb.addOrderBy('status_order', 'ASC');

    qb.addSelect(
      `CASE WHEN asset.asset_tag ~ '^[0-9]+$' THEN 0 ELSE 1 END`,
      'tag_is_number',
    );

    qb.addSelect(
      `CASE WHEN asset.asset_tag ~ '^[0-9]+$' THEN CAST(asset.asset_tag AS BIGINT) ELSE NULL END`,
      'tag_number_value',
    );

    qb.orderBy('status_order', 'ASC');
    qb.addOrderBy('tag_is_number', 'ASC');
    qb.addOrderBy('tag_number_value', 'ASC');
    qb.addOrderBy('asset.assetTag', 'DESC');

    if (isList) {
      query.limit = 10;
    }

    const { data: assets, meta } = await paginateQb(qb, query);

    if (assets.length === 0) {
      return {
        data: plainToInstance(AssetResponseDto, []),
        meta,
      };
    }

    const assetTags = assets.map((a) => a.assetTag);

    const lastAssignments = await this.assetAssignmentRepository
      .createQueryBuilder('assignment')
      .distinctOn(['assignment.assetTag'])
      .leftJoin('assignment.employee', 'employee')
      .addSelect([
        'employee.nik',
        'employee.name',
        'employee.position',
        'employee.department',
      ])
      .where('assignment.assetTag IN (:...assetTags)', { assetTags })
      .orderBy('assignment.assetTag', 'ASC')
      .addOrderBy('assignment.assignedAt', 'DESC')
      .getMany();

    const lastAssignmentMap = new Map(
      lastAssignments.map((aa) => [aa.assetTag, aa]),
    );

    const formattedAsset = assets.map((asset) => ({
      ...asset,
      assetAssignment: lastAssignmentMap.get(asset.assetTag) ?? null,
    }));

    return {
      data: plainToInstance(AssetResponseDto, formattedAsset),
      meta,
    };
  }

  async findActiveByEmployeeNik(
    employeeNik: string,
  ): Promise<AssetResponseDto[]> {
    const activeAssignments = await this.assetAssignmentRepository.find({
      where: {
        picEmployeeNik: employeeNik,
        returnedAt: IsNull(),
      },
      relations: {
        asset: {
          category: true,
          workLocation: true,
          project: {
            vendor: true,
          },
        },
        employee: true,
      },
      order: {
        assignedAt: 'DESC',
      },
    });

    const assetsWithAssignment = activeAssignments
      .filter((assignment) => assignment.asset)
      .map((assignment) => ({
        ...assignment.asset,
        assetAssignment: assignment,
      }));

    return plainToInstance(AssetResponseDto, assetsWithAssignment);
  }

  async findOne(
    assetTag: string,
    options?: FindOneOptions<Asset>,
    externalManager?: EntityManager,
  ) {
    const baseOptions: FindOneOptions<Asset> = {
      where: { assetTag },
      relations: {
        // supports: true,
        category: true,
        workLocation: true,
        project: {
          vendor: true,
        },
        assetAssignments: {
          employee: true,
          assignBy: true,
          createdBy: true,
        },
        tickets: {
          engineer: true,
        },
      },
      order: {
        assetAssignments: {
          assignedAt: 'DESC',
        },
        tickets: {
          createdAt: 'DESC',
        },
      },
    };

    const repository = externalManager
      ? externalManager.getRepository(Asset)
      : this.assetRepository;

    const asset = await repository.findOne(options || baseOptions);
    if (!asset) throw new NotFoundException('asset not found');
    return plainToInstance(DetailAssetResponseDto, asset);
  }

  async update(
    assetTag: string,
    dto: UpdateAssetDto,
    externalManager?: EntityManager,
    isFromAssignment?: boolean,
  ) {
    const asset = await this.assetRepository.findOneBy({ assetTag });
    if (!asset) throw new NotFoundException('asset not found');
    if (asset.status === AssetStatus.Assigned && !isFromAssignment) {
      if (
        dto.status !== AssetStatus.Returned &&
        dto.status !== AssetStatus.Missing &&
        dto.status !== AssetStatus.Assigned
      ) {
        throw new BadRequestException(
          ErrorDetailBuilder.buildOne(
            'Asset is currently assigned. You can only update it to Returned or Missing.',
            'status',
          ),
        );
      }
    }

    const isStatusChanged = dto.status && dto.status !== asset.status;

    if (isStatusChanged) {
      if (
        !isFromAssignment &&
        (dto.status === AssetStatus.Assigned ||
          dto.status === AssetStatus.Returned)
      ) {
        throw new BadRequestException(
          ErrorDetailBuilder.buildOne(
            'Cannot update asset status to Assigned or Returned, You can only update it from Asset Assignment',
            'status',
          ),
        );
      }
    }
    try {
      const executor = externalManager
        ? externalManager.getRepository(Asset)
        : this.assetRepository;

      if ((dto.warrantyDate as unknown as string) === '')
        dto.warrantyDate = undefined;
      if ((dto.purchaseDate as unknown as string) === '')
        dto.purchaseDate = undefined;

      this.assetRepository.merge(asset, dto);
      return await executor.save(asset);
    } catch (e) {
      Logger.log(e);
      throw e;
    }
  }

  async remove(assetTag: string) {
    const asset = await this.assetRepository.findOneBy({ assetTag });
    if (!asset) throw new NotFoundException('asset not found');

    const hasAssignment = await this.assetAssignmentRepository.findOne({
      where: [{ assetTag }, { backupForAssetTag: assetTag }],
    });

    const hasTicket = await this.ticketRepository.findOne({
      where: [{ assetTag }, { backupAssetTag: assetTag }],
    });

    if (hasAssignment || hasTicket) {
      throw new BadRequestException(
        'Asset cannot be deleted because it is associated with existing assignments or tickets',
      );
    }

    return await this.assetRepository.delete(assetTag);
  }

  async parseExcel(buffer: Buffer) {
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const records: any[] = XLSX.utils.sheet_to_json(worksheet, {
      raw: false,
      defval: '',
    });

    const categoryList = await this.assetCategoryService.findAll();
    const workLocationList = await this.workLocationsService.findAll();

    const mappedData: CreateAssetDto[] = records.map(
      (row: RawAssetExcelRow) => {
        const support: SupportDetail | undefined = row['support_sn']
          ? ({
              type: row['support_type'],
              sn: row['support_sn'],
              name: row['support_name'],
            } as unknown as SupportDetail)
          : undefined;

        const categoryVal = row['category_id'] ?? row['category'];
        let categoryId: number;

        if (isNaN(Number(categoryVal))) {
          const foundCategory = categoryList.find(
            (cat) =>
              cat.name.toLowerCase() ===
              categoryVal?.toString().toLowerCase().trim(),
          );
          if (foundCategory) {
            categoryId = foundCategory.id;
          } else {
            throw new NotFoundException(
              `${categoryVal} not in asset category list`,
            );
          }
        } else {
          categoryId = Number(categoryVal);
        }

        const locationVal =
          row['work_location_id'] ??
          row['work_location'] ??
          row['location_id'] ??
          row['location'];
        let workLocationId: number | undefined = undefined;

        if (
          locationVal !== undefined &&
          locationVal !== null &&
          locationVal !== ''
        ) {
          if (isNaN(Number(locationVal))) {
            const foundLocation = workLocationList.find(
              (loc) =>
                loc.name.toLowerCase() ===
                locationVal.toString().toLowerCase().trim(),
            );
            if (foundLocation) {
              workLocationId = foundLocation.id;
            } else {
              throw new NotFoundException(
                `${locationVal} not in work location list`,
              );
            }
          } else {
            workLocationId = Number(locationVal);
          }
        }

        return {
          assetTag: row['assettag'],
          hostname: row['hostname'] ?? undefined,
          serialNumber: row['sn']?.toString().trim() || undefined,
          categoryId: categoryId,
          workLocationId: workLocationId,
          type: row['type'],
          projectName: row['project'],
          support: support,
          status: row['status'],
          purchaseDate: row['purchase_date']
            ? new Date(row['purchase_date'])
            : undefined,
          warrantyDate: row['warranty_date']
            ? new Date(row['warranty_date'])
            : undefined,
          storageType: row['storage_type'] ?? undefined,
          storageCapacityByte: Number(row['storage_capacity_byte']),
          memoryType: row['memory_type'] ?? undefined,
          memoryCapacityByte: Number(row['memory_capacity_byte']),
          processor: row['processor'],
        };
      },
    );

    return await this.bulkSaveUsers(mappedData);
  }

  private async bulkSaveUsers(dto: CreateAssetDto[]) {
    return await this.assetRepository.upsert(dto, {
      conflictPaths: ['assetTag'],
      skipUpdateIfNoValuesChanged: true,
      upsertType: 'on-conflict-do-update',
    });
  }
}
