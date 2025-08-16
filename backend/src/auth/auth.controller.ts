import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateShopkeeperDto } from '../shopkeeper/dto/create-shopkeeper.dto';
import { LoginShopkeeperDto } from '../shopkeeper/dto/login-shopkeeper.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

interface JwtPayload {
  email: string;
  sub: number;
  shopName: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(
    @Body() createShopkeeperDto: CreateShopkeeperDto,
  ): Promise<AuthResponseDto> {
    return this.authService.register(createShopkeeperDto);
  }

  @Public()
  @Post('login')
  async login(
    @Body() loginShopkeeperDto: LoginShopkeeperDto,
  ): Promise<AuthResponseDto> {
    return this.authService.login(loginShopkeeperDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: JwtPayload) {
    return {
      message: 'Profile retrieved successfully',
      user,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('validate')
  validateToken(@CurrentUser() user: JwtPayload) {
    return {
      valid: true,
      user,
    };
  }
}
