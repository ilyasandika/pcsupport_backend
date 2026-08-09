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
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

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
}
