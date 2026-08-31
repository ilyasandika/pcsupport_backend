// ticket/config/multer.config.ts
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';
import * as fs from 'node:fs';

export const pdfMulterOptions = {
  storage: diskStorage({
    destination: (req, file, callback) => {
      const dir = './storages/tickets';
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      callback(null, dir);
    },
    filename: (req, file, callback) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      callback(null, `ticket-${uniqueSuffix}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (req: any, file: Express.Multer.File, callback: any) => {
    if (file.mimetype !== 'application/pdf') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call
      return callback(
        new BadRequestException('Only PDF files are allowed'),
        false,
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    callback(null, true);
  },
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
};

export const assetAssignmentMulterOptions = {
  storage: diskStorage({
    destination: (req, file, callback) => {
      const dir = './storages/asset_assignments';
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      callback(null, dir);
    },
    filename: (req, file, callback) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      callback(
        null,
        `asset_assignment-${uniqueSuffix}${extname(file.originalname)}`,
      );
    },
  }),
};

export const signatureMulterOptions = {
  storage: diskStorage({
    destination: (req, file, callback) => {
      const dir = './storages/signatures';
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      callback(null, dir);
    },
    filename: (req, file, callback) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      callback(null, `user-signature-${uniqueSuffix}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (req: any, file: Express.Multer.File, callback: any) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
      return callback(
        new BadRequestException('Only image files (JPG, JPEG, PNG) are allowed'),
        false,
      );
    }
    callback(null, true);
  },
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
};
