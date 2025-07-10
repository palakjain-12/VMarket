import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  getHello(): string {
    return 'VMarket API is running!';
  }

  async checkDatabase(): Promise<string> {
    try {
      // Test database connection
      await this.prisma.$queryRaw`SELECT 1`;
      return 'Database connection successful!';
    } catch (error) {
      return `Database connection failed: ${error.message}`;
    }
  }
}