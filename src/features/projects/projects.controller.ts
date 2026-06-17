import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  findAll() {
    return this.projectsService.findAll();
  }

  @Get(':name')
  findOne(@Param('name') name: string) {
    return this.projectsService.findOne(name);
  }

  @Patch(':name')
  update(
    @Param('name') name: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectsService.update(name, updateProjectDto);
  }

  @Delete(':name')
  remove(@Param('name') name: string) {
    return this.projectsService.remove(name);
  }
}
