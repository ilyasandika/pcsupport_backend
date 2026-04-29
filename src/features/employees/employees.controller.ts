import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Get,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}
  @Get()
  test() {
    return 'test';
  }

  @Post('import-csv')
  @UseInterceptors(FileInterceptor('file')) // 'file' must match the key in Postman/Frontend
  async importCsv(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 2 }), // Limit to 2MB
          new FileTypeValidator({
            fileType: 'text/csv',
            skipMagicNumbersValidation: true,
          }), // Ensure it's a CSV
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return await this.employeesService.parseCsv(file.buffer);
  }
}
