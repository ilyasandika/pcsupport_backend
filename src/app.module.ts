import { Module } from '@nestjs/common';
import { UsersModule } from './features/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    UsersModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: (process.env.DB_TYPE as 'mysql' | 'postgres') || 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_DATABASE || 'pcsupport',
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV == 'development', //pastikan false ya nanti cok kalo udah prod
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
