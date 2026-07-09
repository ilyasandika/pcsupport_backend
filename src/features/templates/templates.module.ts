import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';
import { Template } from './entities/template.entity';

export const TEMPLATE_UPLOAD_DIR = './storage/templates';

@Module({
  imports: [
    TypeOrmModule.forFeature([Template]),
    MulterModule.register({
      storage: diskStorage({
        destination: TEMPLATE_UPLOAD_DIR,
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedMime =
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        const allowedExt = '.docx';

        const isMimeValid = file.mimetype === allowedMime;
        const isExtValid =
          extname(file.originalname).toLowerCase() === allowedExt;

        if (!isMimeValid || !isExtValid) {
          return cb(new Error('Hanya file .docx yang diperbolehkan'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 1 * 1024 * 1024, // 1MB
      },
    }),
  ],
  controllers: [TemplatesController],
  providers: [TemplatesService],
  exports: [TemplatesService],
})
export class TemplatesModule {}
