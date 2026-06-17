import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async create(dto: CreateProjectDto) {
    const project = this.projectRepository.create(dto);
    return await this.projectRepository.save(project);
  }

  async findAll() {
    return await this.projectRepository.find();
  }

  async findOne(name: string) {
    const project = await this.projectRepository.findOneBy({ name });
    if (!project) throw new NotFoundException('not found');
    return project;
  }

  async update(name: string, dto: UpdateProjectDto) {
    const project = await this.projectRepository.findOneBy({ name });
    if (!project) throw new NotFoundException('not found');
    this.projectRepository.merge(project, dto);
    return await this.projectRepository.save(project);
  }

  async remove(name: string) {
    const project = await this.projectRepository.findOneBy({ name });
    if (!project) throw new NotFoundException('not found');
    return await this.projectRepository.delete(project);
  }
}
