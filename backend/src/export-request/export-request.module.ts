// src/export-request/export-request.module.ts
import { Module } from '@nestjs/common';
import { ExportRequestService } from './export-request.service';
import { ExportRequestController } from './export-request.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ExportRequestController],
  providers: [ExportRequestService],
})
export class ExportRequestModule {}
