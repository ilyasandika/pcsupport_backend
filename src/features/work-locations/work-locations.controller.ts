import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WorkLocationsService } from './work-locations.service';
import { CreateWorkLocationDto } from './dto/create-work-location.dto';
import { UpdateWorkLocationDto } from './dto/update-work-location.dto';

@Controller('work-locations')
export class WorkLocationsController {
  constructor(private readonly workLocationsService: WorkLocationsService) {}

  @Post()
  create(@Body() dto: CreateWorkLocationDto) {
    return this.workLocationsService.create(dto);
  }

  @Get()
  findAll() {
    return this.workLocationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workLocationsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWorkLocationDto) {
    return this.workLocationsService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workLocationsService.remove(+id);
  }
}
