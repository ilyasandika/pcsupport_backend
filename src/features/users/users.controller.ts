import {
  Controller,
  Post,
  Body,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
  Get,
  Param,
  Patch,
  Put,
  Delete,
  UseGuards,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Logger,
  Res,
} from '@nestjs/common';
import express from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { SyncUserTagsDto } from './dto/sync-user-tags.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateTemplateDto } from '../templates/dto/create-template.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import fs from 'node:fs';
import { memoryStorage } from 'multer';
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
// @Roles(Role.Admin)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('engineers')
  // @Roles(Role.Admin, Role.Supervisor)
  findEngineers() {
    return this.usersService.findEngineers();
  }

  @Get('supervisors')
  // @Roles(Role.Admin)
  findSupervisors() {
    return this.usersService.findSupervisors();
  }

  @Get(':id')
  @Roles(Role.Admin, Role.Supervisor)
  findOne(@Param('id') id: number) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(+id, dto);
  }

  @Patch('password/:id')
  async updatePassword(
    @Param('id') id: string,
    @Body() dto: UpdateUserPasswordDto,
  ) {
    return await this.usersService.updatePassword(+id, dto);
  }

  @Patch(':id/status')
  async toggleStatus(
    @Param('id') id: string,
    @Body('active') active?: boolean,
  ) {
    if (typeof active === 'boolean') {
      return await this.usersService.setActiveStatus(+id, active);
    }
    return await this.usersService.toggleStatus(+id);
  }

  @Patch(':id/toggle-status')
  async toggleStatusAlias(@Param('id') id: string) {
    return await this.usersService.toggleStatus(+id);
  }

  @Patch(':id/activate')
  async activateUser(@Param('id') id: string) {
    return await this.usersService.activateUser(+id);
  }

  @Patch(':id/deactivate')
  async deactivateUser(@Param('id') id: string) {
    return await this.usersService.deactivateUser(+id);
  }

  @Post(':id/sync-tags')
  @Roles(Role.Admin, Role.Supervisor)
  async syncUserTags(
    @Param('id') id: string,
    @Body() bodyDto?: SyncUserTagsDto,
    @Query() queryDto?: SyncUserTagsDto,
  ) {
    const dto: SyncUserTagsDto = {
      period: bodyDto?.period || queryDto?.period,
      year: bodyDto?.year ?? queryDto?.year,
      month: bodyDto?.month ?? queryDto?.month,
    };
    return await this.usersService.syncUserTags(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Get(':id/signature')
  async viewSignature(@Param('id') id: string, @Res() res: express.Response) {
    const fileStream = await this.usersService.getSignatureStream(+id);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="signature-${id}.png"`,
    );
    fileStream.pipe(res);
  }

  @Post(':id/signature')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSignature(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /^image\/(png|jpeg|jpg)$/,
          skipMagicNumbersValidation: true,
        })
        .addMaxSizeValidator({
          maxSize: 1 * 1024 * 1024, // 1MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    return this.usersService.uploadTemplate(+id, file);
  }

  @Delete(':id/signature')
  async deleteSignature(@Param('id') id: string) {
    return await this.usersService.deleteSignature(+id);
  }

  @Post('import-excel')
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
  }))
  async importExcel(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType:
            /^(text\/csv|application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet)$/,
          skipMagicNumbersValidation: true,
        })
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    return await this.usersService.parseExcel(file.buffer);
  }
}
