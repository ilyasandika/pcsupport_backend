import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AssetSupportsService } from './asset_supports.service';
import { CreateAssetSupportDto } from './dto/create-asset_support.dto';
import { UpdateAssetSupportDto } from './dto/update-asset_support.dto';

@Controller('asset-supports')
export class AssetSupportsController {
  constructor(private readonly assetSupportsService: AssetSupportsService) {}

  @Post()
  create(@Body() dto: CreateAssetSupportDto) {
    return this.assetSupportsService.create(dto);
  }

  @Get()
  findAll() {
    return this.assetSupportsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assetSupportsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAssetSupportDto) {
    return this.assetSupportsService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assetSupportsService.remove(+id);
  }
}
