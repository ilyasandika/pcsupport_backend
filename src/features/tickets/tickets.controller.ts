import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Res,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { type JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { GetTicketTrendDto } from './dto/trend-ticket.dto';
import express from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  pdfMulterOptions,
  signatureMulterOptions,
} from '../../config/multer.config';
import { CreateTicketPdfDto } from './dto/create-ticket-pdf.dto';
import { TicketQueryDto } from './dto/ticket-query.dto';
import { OwnershipGuard } from 'src/common/guards/ownership.guard';
import { CheckOwnership } from 'src/common/decorators/ownership.decorator';
import { CloseTicketDto } from './dto/close-ticket.dto';

@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @Roles(Role.Helpdesk, Role.Admin, Role.Engineer, Role.Supervisor)
  async create(@Body() dto: CreateTicketDto, @GetUser() user: JwtPayload) {
    return await this.ticketsService.create(dto, user.sub as number);
  }

  @Patch('claim/:id')
  @Roles(Role.Engineer, Role.Admin)
  async claim(@Param('id') id: string, @GetUser() user: JwtPayload) {
    return await this.ticketsService.claimTicket(+id, user.sub as number);
  }

  @Get()
  async findAll(@Query() query: TicketQueryDto, @GetUser() user: JwtPayload) {
    return await this.ticketsService.findAll(query, user);
  }

  @Get('dashboard')
  async findPriority(
    @Query() query: TicketQueryDto,
    @GetUser() user: JwtPayload,
  ) {
    return await this.ticketsService.findAll(query, user, true);
  }

  @Get('/count/status')
  getCountByStatus(@GetUser() user: JwtPayload) {
    return this.ticketsService.getCountByStatus(user);
  }

  @Get('/trend/time')
  getTrendByTime(@Query() query: GetTicketTrendDto) {
    return this.ticketsService.getTicketTrend(query.range);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser() user: JwtPayload) {
    return this.ticketsService.findOne(+id, user);
  }

  @Patch(':id')
  @UseGuards(OwnershipGuard)
  @CheckOwnership({
    service: TicketsService,
    ownershipField: 'engineerId',
    bypassRoles: [Role.Admin, Role.Supervisor, Role.Helpdesk],
    paramKey: 'id',
  })
  update(@Param('id') id: string, @Body() dto: UpdateTicketDto) {
    return this.ticketsService.update(+id, dto);
  }

  @Patch('close/:id')
  @UseGuards(OwnershipGuard)
  @CheckOwnership({
    service: TicketsService,
    ownershipField: 'engineerId',
    bypassRoles: [Role.Admin, Role.Supervisor, Role.Helpdesk],
    paramKey: 'id',
  })
  close(@Param('id') id: string, @Body() dto: CloseTicketDto) {
    dto.solvedAt = new Date();
    return this.ticketsService.update(+id, dto);
  }

  @Roles(Role.Admin, Role.Helpdesk, Role.Supervisor)
  @Delete(':id/hard')
  remove(@Param('id') id: string) {
    return this.ticketsService.hardRemove(+id);
  }

  @Post(':id/pdf')
  async generateTicket(
    @Param('id') id: string,
    @Body() dto: CreateTicketPdfDto,
    @Res() res: express.Response,
  ) {
    const pdfBuffer = await this.ticketsService.generatePdf(+id, dto);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="ticket-${id}.pdf"`);
    res.send(pdfBuffer);
  }

  @Post(':id/upload')
  @UseInterceptors(FileInterceptor('file', pdfMulterOptions))
  async uploadPdf(
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
    return this.ticketsService.uploadTicketPdf(+id, file);
  }

  @Delete(':id/pdf')
  async deleteTicketPdf(@Param('id') id: string) {
    return this.ticketsService.deleteTicketPdf(+id);
  }

  @Post(':id/user-signature')
  @UseInterceptors(FileInterceptor('file', signatureMulterOptions))
  async uploadUserSignature(
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
    return this.ticketsService.uploadUserSignature(+id, file);
  }

  @Get(':id/user-signature')
  async getUserSignature(
    @Param('id') id: string,
    @Res() res: express.Response,
  ) {
    const fileStream = await this.ticketsService.getUserSignatureStream(+id);
    res.setHeader('Content-Type', 'image/png');
    fileStream.pipe(res);
  }

  @Post(':id/approve')
  async approveTicket(
    @Param('id') id: string,
    @Body('supervisorId') supervisorId: number,
  ) {
    return this.ticketsService.approveTicket(+id, supervisorId);
  }

  @Get(':id/solved/pdf')
  async viewTicket(@Param('id') id: string, @Res() res: express.Response) {
    const fileStream = await this.ticketsService.getTicketStream(+id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="ticket-${id}.pdf"`);
    // res.send(fileStream);
    fileStream.pipe(res);
  }

  @Post('import-excel')
  @Roles(Role.Admin, Role.Helpdesk)
  @UseInterceptors(FileInterceptor('file'))
  async importExcel(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType:
            /^(text\/csv|application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet)$/,
          skipMagicNumbersValidation: true,
        })
        .addMaxSizeValidator({
          maxSize: 10 * 1024 * 1024,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
    @GetUser() user: JwtPayload,
  ) {
    return await this.ticketsService.importExcel(
      file.buffer,
      user.sub as number,
    );
  }
}
