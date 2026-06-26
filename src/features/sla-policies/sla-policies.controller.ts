import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SlaPoliciesService } from './sla-policies.service';
import { CreateSlaPolicyDto } from './dto/create-sla-policy.dto';
import { UpdateSlaPolicyDto } from './dto/update-sla-policy.dto';

@Controller('sla-policies')
export class SlaPoliciesController {
  constructor(private readonly slaPoliciesService: SlaPoliciesService) {}

  @Post()
  create(@Body() dto: CreateSlaPolicyDto) {
    return this.slaPoliciesService.create(dto);
  }

  @Get()
  findAll() {
    return this.slaPoliciesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.slaPoliciesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSlaPolicyDto: UpdateSlaPolicyDto,
  ) {
    return this.slaPoliciesService.update(+id, updateSlaPolicyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.slaPoliciesService.remove(+id);
  }
}
