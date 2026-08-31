import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Logger,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { AssetAssignmentsService } from './asset_assignments.service';
import { CreateAssetAssignmentDto } from './dto/create-asset_assignment.dto';
import { UpdateAssetAssignmentDto } from './dto/update-asset_assignment.dto';
import { ReturnAssetAssignmentDto } from './dto/return-asset_assignment.dto';
import express from 'express';
import { CreateAssignmentPdfDto } from './dto/create-asset_assignment-pdf.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import * as jwtPayloadInterface from '../../common/interfaces/jwt-payload.interface';
import { Role } from '../../common/enums/role.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { assetAssignmentMulterOptions, signatureMulterOptions } from '../../config/multer.config';
import { type JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@Controller('asset-assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssetAssignmentsController {
  constructor(
    private readonly assetAssignmentsService: AssetAssignmentsService,
  ) {}

  @Post()
  @Roles(Role.Admin)
  async create(
    @Body() dto: CreateAssetAssignmentDto,
    @GetUser() user: jwtPayloadInterface.JwtPayload,
  ) {
    return await this.assetAssignmentsService.create(dto, user.sub as number);
  }

  @Get('assets/:id')
  async findByAssetId(@Param('id') id: string) {
    return await this.assetAssignmentsService.findAllByAssetTag(id);
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

  @Patch(':id/return')
  async return(
    @Param('id') id: string,
    @Body() dto: ReturnAssetAssignmentDto,
    @GetUser() user: JwtPayload,
  ) {
    return await this.assetAssignmentsService.returnAssignment(+id, dto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assetAssignmentsService.remove(+id);
  }

  @Post(':id/assign/pdf')
  async generateAssignBast(
    @Param('id') id: string,
    @Body() dto: CreateAssignmentPdfDto,
    @Res() res: express.Response,
  ) {
    const pdfBuffer = await this.assetAssignmentsService.createBastFromTemplate(
      +id,
      dto,
      'assign',
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="bast-${id}.pdf"`);
    res.send(pdfBuffer);
  }
  @Post(':id/return/pdf')
  async generateReturnBast(
    @Param('id') id: string,
    @Body() dto: CreateAssignmentPdfDto,
    @Res() res: express.Response,
  ) {
    const pdfBuffer = await this.assetAssignmentsService.createBastFromTemplate(
      +id,
      dto,
      'return',
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="bast-${id}.pdf"`);
    res.send(pdfBuffer);
  }

  @Post(':id/pdf')
  async generateBast(
    @Param('id') id: string,
    @Body() dto: CreateAssignmentPdfDto,
    @Res() res: express.Response,
  ) {
    const pdfBuffer = await this.assetAssignmentsService.createBastFromTemplate(
      +id,
      dto,
    );
    Logger.log(pdfBuffer);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="bast-${id}.pdf"`);
    res.send(pdfBuffer);
  }

  @Post(':id/upload/assign')
  @UseInterceptors(FileInterceptor('file', assetAssignmentMulterOptions))
  async uploadPdfAssign(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'application/pdf',
          skipMagicNumbersValidation: true,
        })
        .addMaxSizeValidator({ maxSize: 2 * 1024 * 1024 })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    )
    file: Express.Multer.File,
  ) {
    return this.assetAssignmentsService.uploadAssetAssignmentPdf(
      +id,
      file,
      'assign',
    );
  }

  @Post(':id/upload/return')
  @UseInterceptors(FileInterceptor('file', assetAssignmentMulterOptions))
  async uploadPdfReturn(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'application/pdf',
          skipMagicNumbersValidation: true,
        })
        .addMaxSizeValidator({ maxSize: 2 * 1024 * 1024 })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    )
    file: Express.Multer.File,
  ) {
    return this.assetAssignmentsService.uploadAssetAssignmentPdf(
      +id,
      file,
      'return',
    );
  }

  @Delete(':id/pdf/assign')
  async deletePdfAssign(@Param('id') id: string) {
    return this.assetAssignmentsService.deleteAssetAssignmentPdf(+id, 'assign');
  }

  @Delete(':id/pdf/return')
  async deletePdfReturn(@Param('id') id: string) {
    return this.assetAssignmentsService.deleteAssetAssignmentPdf(+id, 'return');
  }

  @Post(':id/user-signature/assign')
  @UseInterceptors(FileInterceptor('file', signatureMulterOptions))
  async uploadUserSignatureAssign(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /^image\/(png|jpeg|jpg)$/,
          skipMagicNumbersValidation: true,
        })
        .addMaxSizeValidator({ maxSize: 2 * 1024 * 1024 })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    )
    file: Express.Multer.File,
  ) {
    return this.assetAssignmentsService.uploadUserSignature(+id, file, 'assign');
  }

  @Post(':id/user-signature/return')
  @UseInterceptors(FileInterceptor('file', signatureMulterOptions))
  async uploadUserSignatureReturn(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /^image\/(png|jpeg|jpg)$/,
          skipMagicNumbersValidation: true,
        })
        .addMaxSizeValidator({ maxSize: 2 * 1024 * 1024 })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    )
    file: Express.Multer.File,
  ) {
    return this.assetAssignmentsService.uploadUserSignature(+id, file, 'return');
  }

  @Get(':id/user-signature/assign')
  async getUserSignatureAssign(
    @Param('id') id: string,
    @Res() res: express.Response,
  ) {
    const fileStream = await this.assetAssignmentsService.getUserSignatureStream(+id, 'assign');
    res.setHeader('Content-Type', 'image/png');
    fileStream.pipe(res);
  }

  @Get(':id/user-signature/return')
  async getUserSignatureReturn(
    @Param('id') id: string,
    @Res() res: express.Response,
  ) {
    const fileStream = await this.assetAssignmentsService.getUserSignatureStream(+id, 'return');
    res.setHeader('Content-Type', 'image/png');
    fileStream.pipe(res);
  }

  @Get(':id/pdf')
  async viewPdf(@Param('id') id: string, @Res() res: express.Response) {
    const fileStream =
      await this.assetAssignmentsService.getAssetAssignmentStream(+id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="asset-assignment-${id}.pdf"`,
    );
    fileStream.pipe(res);
  }

  @Post('import-excel')
  @UseInterceptors(FileInterceptor('file'))
  async importExcel(
    @GetUser() user: JwtPayload,
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
    return await this.assetAssignmentsService.parseExcel(file.buffer, user);
  }
}
