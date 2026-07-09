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

  @Post('import-csv')
  @UseInterceptors(FileInterceptor('file'))
  async importCsv(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 2 }), // Limit to 2MB
          new FileTypeValidator({
            fileType: 'text/csv',
            skipMagicNumbersValidation: true,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return await this.employeesService.parseCsv(file.buffer);
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
