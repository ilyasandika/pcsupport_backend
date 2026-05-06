import { Injectable } from '@nestjs/common';
import { CreateWorkLocationDto } from './dto/create-work-location.dto';
import { UpdateWorkLocationDto } from './dto/update-work-location.dto';

@Injectable()
export class WorkLocationsService {
  create(createWorkLocationDto: CreateWorkLocationDto) {
    return 'This action adds a new workLocation';
  }

  findAll() {
    return `This action returns all workLocations`;
  }

  findOne(id: number) {
    return `This action returns a #${id} workLocation`;
  }

  update(id: number, updateWorkLocationDto: UpdateWorkLocationDto) {
    return `This action updates a #${id} workLocation`;
  }

  remove(id: number) {
    return `This action removes a #${id} workLocation`;
  }
}
