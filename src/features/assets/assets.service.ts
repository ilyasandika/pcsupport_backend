import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Asset } from './entities/asset.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
  ) {}

  async create(dto: CreateAssetDto) {
    return await this.assetRepository.save(dto);
    // try {
    //   return await this.assetRepository.save(dto);
    // } catch {
    //   throw new ConflictException();
    // }
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
    return await this.assetRepository.save(dto);
  }

  async remove(id: number) {
    const asset = await this.assetRepository.findOneBy({ id });
    if (!asset) throw new NotFoundException('asset not found');
    return await this.assetRepository.delete(id);
  }
}
