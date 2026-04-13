import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { globalValidationPipeConfig } from './common/configs/validation-pipe.config';
import { GlobalExceptionFilter } from './common/exceptions/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(globalValidationPipeConfig);
  app.useGlobalFilters(new GlobalExceptionFilter());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
