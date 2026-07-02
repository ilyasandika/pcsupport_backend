import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Asset } from './entities/asset.entity';
import { Repository } from 'typeorm';
import { ErrorDetailBuilder } from '../../common/utils/error-detail-builder';
import { AssetCategory } from '../../common/enums/asset-type.enum';
import {
  instanceToPlain,
  plainToClass,
  plainToInstance,
} from 'class-transformer';
import { DetailAssetResponseDto } from './dto/asset-response.dto';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
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

  async findAll() {
    const asset = await this.assetRepository.find({
      relations: {
        workLocation: true,
        supports: true,
        category: true,
        project: {
          vendor: true,
        },
        assetAssignments: {
          employee: true,
        },
      },
      order: {
        assetAssignments: {
          assignedAt: 'DESC',
        },
      },
    });

    const formattedAsset = asset.map((asset) => {
      if (asset.assetAssignments.length > 0) {
        const lastAssignment = asset.assetAssignments[0];
        return {
          ...asset,
          assetAssignment: lastAssignment,
        };
      }
      return asset;
    });
    return plainToInstance(DetailAssetResponseDto, formattedAsset);
  }

  async findOne(id: number) {
    const asset = await this.assetRepository.findOne({
      where: { id },
      relations: {
        workLocation: true,
        supports: true,
        category: true,
        project: {
          vendor: true,
        },
        assetAssignments: {
          employee: true,
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
    });
    if (!asset) throw new NotFoundException('asset not found');
    return plainToInstance(DetailAssetResponseDto, asset);
  }

  async update(id: number, dto: UpdateAssetDto) {
    const asset = await this.assetRepository.findOneBy({ id });
    if (!asset) throw new NotFoundException('asset not found');
    this.assetRepository.merge(asset, dto);
    return await this.assetRepository.save(asset);
  }

  async remove(id: number) {
    const asset = await this.assetRepository.findOneBy({ id });
    if (!asset) throw new NotFoundException('asset not found');
    return await this.assetRepository.delete(id);
  }
}
