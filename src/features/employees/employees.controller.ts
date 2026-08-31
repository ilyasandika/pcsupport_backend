import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Get,
  Param,
  Body,
  Patch,
  Delete,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  async create(@Body() dto: CreateEmployeeDto) {
    return await this.employeesService.create(dto);
  }

  @Post('import-excel')
  @UseInterceptors(FileInterceptor('file'))
  async importExcel(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
          new FileTypeValidator({
            fileType:
              /(vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet|vnd\.ms-excel|excel)/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return await this.employeesService.parseExcel(file.buffer);
  }

  @Get()
  async findAll() {
    return await this.employeesService.findAll();
  }

  @Get('list')
  async findAllForList() {
    return await this.employeesService.findAll(true);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.employeesService.findOne(id);
  }

  @Patch(':nik')
  async update(
    @Param('nik') nik: string,
    @Body() dto: UpdateEmployeeDto,
  ) {
    return await this.employeesService.update(nik, dto);
  }

  @Delete(':nik')
  async remove(@Param('nik') nik: string) {
    return await this.employeesService.remove(nik);
  }
}
