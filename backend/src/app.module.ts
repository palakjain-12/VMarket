import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ShopkeeperModule } from './shopkeeper/shopkeeper.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import configuration from './config/configuration';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import { ProductModule } from './product/product.module';
import { ExportRequestModule } from './export-request/export-request.module';
import { ExportRequestController } from './export-request/export-request.controller';
import { ExportRequestService } from './export-request/export-request.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration, databaseConfig, jwtConfig],
      envFilePath: ['.env.local', '.env'],
      validationSchema: null, // You can add Joi validation here later
    }),
    PrismaModule,
    AuthModule,
    ShopkeeperModule,
    ProductModule,
    ExportRequestModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}