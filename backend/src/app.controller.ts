import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator'; // adjust import path

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello(): { message: string } {
    return { message: 'Welcome to VMarket API 🚀' };
  }

  @Public()
  @Get('health')
  async checkHealth(): Promise<string> {
    return this.appService.checkDatabase();
  }
}
