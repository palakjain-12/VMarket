import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ShopkeeperService } from '../shopkeeper/shopkeeper.service';
import { LoginShopkeeperDto } from '../shopkeeper/dto/login-shopkeeper.dto';
import { CreateShopkeeperDto } from '../shopkeeper/dto/create-shopkeeper.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private shopkeeperService: ShopkeeperService,
    private jwtService: JwtService,
  ) {}

  async register(
    createShopkeeperDto: CreateShopkeeperDto,
  ): Promise<AuthResponseDto> {
    const shopkeeper = await this.shopkeeperService.create(createShopkeeperDto);

    const payload = {
      email: shopkeeper.email,
      sub: shopkeeper.id,
      shopName: shopkeeper.shopName,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      shopkeeper: {
        id: shopkeeper.id,
        email: shopkeeper.email,
        name: shopkeeper.name,
        shopName: shopkeeper.shopName,
        phone: shopkeeper.phone,
        address: shopkeeper.address,
      },
    };
  }

  async login(
    loginShopkeeperDto: LoginShopkeeperDto,
  ): Promise<AuthResponseDto> {
    const { email, password } = loginShopkeeperDto;

    const shopkeeper = await this.shopkeeperService.findByEmail(email);
    if (!shopkeeper) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.shopkeeperService.validatePassword(
      password,
      shopkeeper.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      email: shopkeeper.email,
      sub: shopkeeper.id,
      shopName: shopkeeper.shopName,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      shopkeeper: {
        id: shopkeeper.id,
        email: shopkeeper.email,
        name: shopkeeper.name,
        shopName: shopkeeper.shopName,
        phone: shopkeeper.phone,
        address: shopkeeper.address,
      },
    };
  }

  async validateUser(email: string): Promise<any> {
    const shopkeeper = await this.shopkeeperService.findByEmail(email);
    if (shopkeeper) {
      const { password: _, ...result } = shopkeeper;
      return result;
    }
    return null;
  }
}
