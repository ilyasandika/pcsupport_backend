import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
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
  //
  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.assetAssignmentsService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAssetAssignmentDto: UpdateAssetAssignmentDto) {
  //   return this.assetAssignmentsService.update(+id, updateAssetAssignmentDto);
  // }
  //
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.assetAssignmentsService.remove(+id);
  // }
}
