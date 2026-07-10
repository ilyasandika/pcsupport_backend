import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersModule } from './features/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './features/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { EmployeesModule } from './features/employees/employees.module';
import { AssetsModule } from './features/assets/assets.module';
import { WorkLocationsModule } from './features/work-locations/work-locations.module';
import { VendorsModule } from './features/vendors/vendors.module';
import { VendorSupportContactsModule } from './features/vendor_support_contacts/vendor_support_contacts.module';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { AssetAssignmentsModule } from './features/asset_assignments/asset_assignments.module';
import { TicketsModule } from './features/tickets/tickets.module';
import { AssetSupportsModule } from './features/asset_supports/asset_supports.module';
import { ProjectsModule } from './features/projects/projects.module';
import { SlaPoliciesModule } from './features/sla-policies/sla-policies.module';
import { AssetCategoriesModule } from './features/asset_categories/asset_categories.module';
import { TemplatesModule } from './features/templates/templates.module';

@Module({
  imports: [
    AuthModule,
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
      database: process.env.DB_NAME || 'pcsupport',
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV == 'development', //pastikan false ya nanti cok kalo udah prod
    }),
    PassportModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    EmployeesModule,
    AssetsModule,
    WorkLocationsModule,
    VendorsModule,
    VendorSupportContactsModule,
    AssetAssignmentsModule,
    TicketsModule,
    AssetSupportsModule,
    ProjectsModule,
    SlaPoliciesModule,
    AssetCategoriesModule,
    TemplatesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
