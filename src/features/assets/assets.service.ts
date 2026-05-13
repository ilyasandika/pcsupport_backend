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
import { Asset } from './entities/asset.entity';
import { Repository } from 'typeorm';
import { ErrorDetailBuilder } from '../../common/utils/error-detail-builder';

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
    return await this.assetRepository.save(dto);
  }

  async findAll() {
    return await this.assetRepository.find({
      relations: {
        workLocation: true,
        vendor: true,
      },
    });
  }

  async findOne(id: number) {
    try {
      return await this.assetRepository.findOneOrFail({
        where: { id },
        relations: {
          workLocation: true,
          vendor: true,
        },
      });
    } catch {
      throw new NotFoundException('asset not found');
    }
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
