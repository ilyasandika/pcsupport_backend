import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateWorkLocationDto } from './dto/create-work-location.dto';
import { UpdateWorkLocationDto } from './dto/update-work-location.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkLocation } from './entities/work-location.entity';
import { Raw, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { DetailWorkLocationResponseDto } from './dto/work-location-response.dto';

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
    const locations = await this.workLocationRepository.find();
    return plainToInstance(DetailWorkLocationResponseDto, locations);
  }

  async findOne(id: number) {
    try {
      return await this.workLocationRepository.findOneByOrFail({ id });
    } catch {
      throw new NotFoundException('Work Location Not Found');
    }
  }

  async findByName(name: string) {
    try {
      return await this.workLocationRepository.findOne({
        where: {
          name: Raw((alias) => `LOWER(${alias}) = LOWER(:searchName)`, {
            searchName: name,
          }),
        },
      });
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
    const location = await this.workLocationRepository.findOne({
      where: { id },
      relations: {
        tickets: true,
        employees: true,
        users: true,
        assets: true,
      },
    });
    if (!location) throw new NotFoundException('Work Location Not Found');

    const hasTickets = location.tickets && location.tickets.length > 0;
    const hasEmployees = location.employees && location.employees.length > 0;
    const hasUsers = location.users && location.users.length > 0;
    const hasAssets = location.assets && location.assets.length > 0;

    if (hasTickets || hasEmployees || hasUsers || hasAssets) {
      throw new BadRequestException(
        'Location cannot be deleted because it is associated with existing tickets, employees, engineers, or assets',
      );
    }

    return await this.workLocationRepository.delete(id);
  }
}
