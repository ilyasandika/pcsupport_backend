import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetCategory } from './entities/asset_category.entity';
import { CreateAssetCategoryDto } from './dto/create-asset_category.dto';
import { UpdateAssetCategoryDto } from './dto/update-asset_category.dto';

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
    const categories = await this.assetCategoryRepository.find({
      relations: {
        assets: true,
      },
      relationLoadStrategy: 'query',
    });

    const formattedCategoryCount = categories.map((category) => {
      return {
        label: category.name,
        count: category.assets ? category.assets.length : 0,
      };
    });

    return formattedCategoryCount;
  }

  async findAll(): Promise<AssetCategory[]> {
    return await this.assetCategoryRepository.find();
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
