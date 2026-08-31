import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  ParseFilePipeBuilder,
  HttpStatus,
  Get,
  Param,
  ParseIntPipe,
  Delete,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import type { Response } from 'express';

@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) { }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Body() dto: CreateTemplateDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType:
            /^application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document$/,
          skipMagicNumbersValidation: true,
        })
        .addMaxSizeValidator({
          maxSize: 1 * 1024 * 1024, // 1MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    return this.templatesService.uploadTemplate(dto, file);
  }

  @Get()
  async findAll() {
    return this.templatesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.templatesService.findOne(id);
  }

  @Get(':id/download')
  async download(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const { stream, fileName } = await this.templatesService.getTemplateFileStream(id);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });
    stream.pipe(res);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.templatesService.remove(id);
  }
}
