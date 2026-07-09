import { Injectable } from '@nestjs/common';
import { CreateAssetSupportDto } from './dto/create-asset_support.dto';
import { UpdateAssetSupportDto } from './dto/update-asset_support.dto';
import { Repository } from 'typeorm';
import { AssetSupport } from './entities/asset_support.entity';
import { AssetsService } from '../assets/assets.service';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AssetSupportsService {
  constructor(
    @InjectRepository(AssetSupport)
    private readonly assetSupportRepository: Repository<AssetSupport>,
    private readonly assetService: AssetsService,
  ) {}

  async create(dto: CreateAssetSupportDto) {
    await this.assetService.findOne(dto.assetSn);
    const support = this.assetSupportRepository.create(dto);
    return await this.assetSupportRepository.save(support);
  }

  findAll() {
    return `This action returns all assetSupports`;
  }

  findOne(id: number) {
    return `This action returns a #${id} assetSupport`;
  }

  update(id: number, dto: UpdateAssetSupportDto) {
    return `This action updates a #${id} assetSupport`;
  }

  remove(id: number) {
    return `This action removes a #${id} assetSupport`;
  }
}
