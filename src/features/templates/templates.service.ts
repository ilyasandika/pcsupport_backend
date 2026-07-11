import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { promises as fs } from 'fs';
import { Template, TemplateType } from './entities/template.entity';
import { CreateTemplateDto } from './dto/create-template.dto';

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
    const existing = await this.templateRepository.findOne({
      where: { type: dto.type },
    });

    if (existing) {
      await this.deleteFileIfExists(existing.filePath);

      existing.name = dto.name;
      existing.description = dto.description ?? existing.description;
      existing.filePath = file.path;

      try {
        return await this.templateRepository.save(existing);
      } catch {
        await this.deleteFileIfExists(file.path);
        throw new InternalServerErrorException(
          'failed to update template, please try again later',
        );
      }
    }

    // Belum ada, buat baru
    const newTemplate = this.templateRepository.create({
      type: dto.type,
      name: dto.name,
      description: dto.description,
      filePath: file.path,
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

  async findAll(): Promise<Template[]> {
    return this.templateRepository.find();
  }

  async findOne(id: number): Promise<Template> {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException(`Template with id ${id} not found`);
    }
    return template;
  }

  async findByType(type: TemplateType): Promise<Template> {
    const template = await this.templateRepository.findOne({
      where: {
        type: type,
      },
    });
    if (!template) {
      throw new NotFoundException(
        `Template with type ${type} not found`,
      );
    }
    return template;
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
