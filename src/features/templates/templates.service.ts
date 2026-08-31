import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { promises as fs, createReadStream } from 'fs';
import { Template, TemplateType } from './entities/template.entity';
import { CreateTemplateDto } from './dto/create-template.dto';
import { plainToInstance } from 'class-transformer';
import { TemplateResponseDto } from './dto/template-response.dto';
import { extname, join, basename } from 'path';
import { TEMPLATE_UPLOAD_DIR } from '../../common/const/directory.const';
import { rename } from 'node:fs';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectRepository(Template)
    private readonly templateRepository: Repository<Template>,
  ) {}

  async uploadTemplate(
    dto: CreateTemplateDto,
    file: Express.Multer.File,
  ): Promise<Template> {
    const newFilename = `${dto.type}-${Date.now()}${extname(file.originalname)}`;
    const newPath = join(TEMPLATE_UPLOAD_DIR, newFilename);

    const existing = await this.templateRepository.findOne({
      where: { type: dto.type },
    });

    rename(file.path, newPath, (err) => {
      if (err) {
        throw new InternalServerErrorException(
          'Failed to upload template, please try again later',
        );
      }
    });

    if (existing) {
      await this.deleteFileIfExists(existing.filePath);
      existing.description = dto.description ?? existing.description;
      existing.filePath = newPath;

      try {
        return await this.templateRepository.save(existing);
      } catch {
        await this.deleteFileIfExists(file.path);
        throw new InternalServerErrorException(
          'failed to update template, please try again later',
        );
      }
    }
    const newTemplate = this.templateRepository.create({
      type: dto.type,
      description: dto.description,
      filePath: newPath,
    });

    try {
      return await this.templateRepository.save(newTemplate);
    } catch {
      await this.deleteFileIfExists(file.path);
      throw new InternalServerErrorException(
        'Failed to create template, please try again later',
      );
    }
  }

  async findAll() {
    const templates = await this.templateRepository.find();
    return plainToInstance(TemplateResponseDto, templates);
  }

  async findOne(id: number) {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException(`Template with id ${id} not found`);
    }
    return plainToInstance(TemplateResponseDto, template);
  }

  async findByType(type: TemplateType): Promise<Template> {
    const template = await this.templateRepository.findOne({
      where: {
        type: type,
      },
    });
    if (!template) {
      throw new NotFoundException(`Template with type ${type} not found`);
    }
    return template;
  }

  async getTemplateFileStream(id: number) {
    const template = await this.findOne(id);
    try {
      await fs.access(template.filePath);
      const fileName = basename(template.filePath);
      return {
        stream: createReadStream(template.filePath),
        fileName: fileName,
      };
    } catch {
      throw new NotFoundException(`File for template id ${id} not found on disk`);
    }
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    const template = await this.findOne(id);
    await this.deleteFileIfExists(template.filePath);
    await this.templateRepository.remove(template);
    return { deleted: true };
  }

  private async deleteFileIfExists(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }
  }
}
