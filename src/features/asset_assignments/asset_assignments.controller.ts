import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AssetAssignmentsService } from './asset_assignments.service';
import { CreateAssetAssignmentDto } from './dto/create-asset_assignment.dto';
import { UpdateAssetAssignmentDto } from './dto/update-asset_assignment.dto';

@Controller('asset-assignments')
export class AssetAssignmentsController {
  constructor(
    private readonly assetAssignmentsService: AssetAssignmentsService,
  ) {}

  @Post()
  async create(@Body() dto: CreateAssetAssignmentDto) {
    return await this.assetAssignmentsService.create(dto);
  }

  @Get('assets/:id')
  async findByAssetId(@Param('id') id: string) {
    return await this.assetAssignmentsService.findAllByAssetSn(id);
  }

  @Get('employees/:id')
  async findByEmployeeId(@Param('id') id: string) {
    return await this.assetAssignmentsService.findAllByEmployeeNik(id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.assetAssignmentsService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateAssetAssignmentDto) {
    return await this.assetAssignmentsService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assetAssignmentsService.remove(+id);
  }
}
