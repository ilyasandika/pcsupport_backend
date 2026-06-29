import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AssetCategoriesService } from './asset_categories.service';
import { CreateAssetCategoryDto } from './dto/create-asset_category.dto';
import { UpdateAssetCategoryDto } from './dto/update-asset_category.dto';

@Controller('asset-categories')
export class AssetCategoriesController {
  constructor(
    private readonly assetCategoriesService: AssetCategoriesService,
  ) {}

  @Post()
  async create(@Body() dto: CreateAssetCategoryDto) {
    return await this.assetCategoriesService.create(dto);
  }

  @Get('count')
  async getCount() {
    return await this.assetCategoriesService.getCount();
  }

  @Get()
  async findAll() {
    return await this.assetCategoriesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.assetCategoriesService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAssetCategoryDto: UpdateAssetCategoryDto,
  ) {
    return await this.assetCategoriesService.update(
      +id,
      updateAssetCategoryDto,
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.assetCategoriesService.remove(+id);
  }
}
