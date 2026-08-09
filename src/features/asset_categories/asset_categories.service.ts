import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetCategory } from './entities/asset_category.entity';
import { CreateAssetCategoryDto } from './dto/create-asset_category.dto';
import { UpdateAssetCategoryDto } from './dto/update-asset_category.dto';
import { plainToInstance } from 'class-transformer';
import { AssetCategoryResponseDto } from './dto/asset_category-response.dto';

@Injectable()
export class AssetCategoriesService {
  constructor(
    @InjectRepository(AssetCategory)
    private readonly assetCategoryRepository: Repository<AssetCategory>,
  ) {}

  async create(dto: CreateAssetCategoryDto): Promise<AssetCategory> {
    const newCategory = this.assetCategoryRepository.create(dto);
    return await this.assetCategoryRepository.save(newCategory);
  }

  async getCount() {
    const result = await this.assetCategoryRepository
      .createQueryBuilder('category')
      .leftJoin('category.assets', 'asset')
      .select('category.name', 'label')
      .addSelect('COUNT(asset.assetTag)', 'count')
      .groupBy('category.id')
      .getRawMany();

    return result.map((item: { label: string; count: string }) => ({
      label: item.label,
      count: Number(item.count) || 0,
    }));
  }

  async findAll() {
    const categories = await this.assetCategoryRepository.find();
    return plainToInstance(AssetCategoryResponseDto, categories);
  }

  async findOne(id: number): Promise<AssetCategory> {
    const category = await this.assetCategoryRepository.findOneBy({ id });

    if (!category) {
      throw new NotFoundException(`Asset Category not found`);
    }

    return category;
  }

  async update(
    id: number,
    dto: UpdateAssetCategoryDto,
  ): Promise<AssetCategory> {
    const category = await this.findOne(id);
    const updatedCategory = this.assetCategoryRepository.merge(category, dto);

    // Save ke database
    return await this.assetCategoryRepository.save(updatedCategory);
  }

  // 5. Remove
  async remove(id: number): Promise<AssetCategory> {
    const category = await this.findOne(id);
    return await this.assetCategoryRepository.remove(category);
  }
}
