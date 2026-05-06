import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWorkLocationDto } from './dto/create-work-location.dto';
import { UpdateWorkLocationDto } from './dto/update-work-location.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkLocation } from './entities/work-location.entity';
import { Repository } from 'typeorm';

@Injectable()
export class WorkLocationsService {
  constructor(
    @InjectRepository(WorkLocation)
    private readonly workLocationRepository: Repository<WorkLocation>,
  ) {}

  async create(dto: CreateWorkLocationDto) {
    return await this.workLocationRepository.save(dto);
  }

  async findAll() {
    return await this.workLocationRepository.find();
  }

  async findOne(id: number) {
    try {
      return await this.workLocationRepository.findOneByOrFail({ id });
    } catch {
      throw new NotFoundException('Work Location Not Found');
    }
  }

  async update(id: number, dto: UpdateWorkLocationDto) {
    const location = await this.workLocationRepository.findOneBy({ id });
    if (!location) throw new NotFoundException('Work Location Not Found');

    this.workLocationRepository.merge(location, dto);
    return await this.workLocationRepository.save(location);
  }
  async remove(id: number) {
    const location = await this.workLocationRepository.findOneBy({ id });
    if (!location) throw new NotFoundException('Work Location Not Found');
    return await this.workLocationRepository.delete(id);
  }
}
