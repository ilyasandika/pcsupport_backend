import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Logger,
  Param,
  ParseFilePipeBuilder,
  Patch,
  Post, Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { AssetStatus } from './entities/asset.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import fs from 'node:fs';
import { UseTypia } from '../../common/decorators/use-typia.decorator';
import { AssetQueryDto } from './dto/asset-query.dto';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  create(@Body() dto: CreateAssetDto) {
    return this.assetsService.create(dto);
  }

  @Get()
  findAll(@Query() query: AssetQueryDto) {
    return this.assetsService.findAll(query);
  }

  @Get('list/active')
  findActive() {
    return this.assetsService.findAll({
      status: [AssetStatus.AssignedForBackup, AssetStatus.Assigned],
    });
  }

  @Get('list/backup')
  findBackupForList() {
    return this.assetsService.findAll({ status: [AssetStatus.Backup] });
  }

  @Get('employee/:nik')
  findByEmployeeNik(@Param('nik') nik: string) {
    return this.assetsService.findActiveByEmployeeNik(nik);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assetsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAssetDto) {
    return this.assetsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assetsService.remove(id);
  }

  @Post('import-excel')
  @UseInterceptors(FileInterceptor('file'))
  async importExcel(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType:
            /^(text\/csv|application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet)$/,
          skipMagicNumbersValidation: true,
        })
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    return await this.assetsService.parseExcel(file.buffer);
  }
}
