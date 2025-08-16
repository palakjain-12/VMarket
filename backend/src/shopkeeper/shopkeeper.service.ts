import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShopkeeperDto } from './dto/create-shopkeeper.dto';
import { UpdateShopkeeperDto } from './dto/update-shopkeeper.dto';
import { Shopkeeper } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ShopkeeperService {
  constructor(private prisma: PrismaService) {}

  async create(
    createShopkeeperDto: CreateShopkeeperDto,
  ): Promise<Omit<Shopkeeper, 'password'>> {
    const { email, password, ...shopkeeperData } = createShopkeeperDto;

    // Check if shopkeeper already exists
    const existingShopkeeper = await this.prisma.shopkeeper.findUnique({
      where: { email },
    });

    if (existingShopkeeper) {
      throw new ConflictException('Shopkeeper with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create shopkeeper
    const shopkeeper = await this.prisma.shopkeeper.create({
      data: {
        email,
        password: hashedPassword,
        ...shopkeeperData,
      },
    });

    // Return shopkeeper without password
    const { password: _, ...result } = shopkeeper;
    return result;
  }

  async findAll(paginationDto: PaginationDto): Promise<{
    data: Omit<Shopkeeper, 'password'>[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { skip, take } = paginationDto;

    const [shopkeepers, total] = await Promise.all([
      this.prisma.shopkeeper.findMany({
        skip,
        take,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          shopName: true,
          address: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.shopkeeper.count(),
    ]);

    return {
      data: shopkeepers,
      total,
      page: paginationDto.page ?? 1,
      limit: paginationDto.limit ?? 10,
    };
  }

  async findOne(id: string): Promise<Omit<Shopkeeper, 'password'>> {
    const shopkeeper = await this.prisma.shopkeeper.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        shopName: true,
        address: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!shopkeeper) {
      throw new NotFoundException('Shopkeeper not found');
    }

    return shopkeeper;
  }

  async findByEmail(email: string): Promise<Shopkeeper | null> {
    return this.prisma.shopkeeper.findUnique({
      where: { email },
    });
  }

  async update(
    id: string,
    updateShopkeeperDto: UpdateShopkeeperDto,
  ): Promise<Omit<Shopkeeper, 'password'>> {
    const existingShopkeeper = await this.prisma.shopkeeper.findUnique({
      where: { id },
    });

    if (!existingShopkeeper) {
      throw new NotFoundException('Shopkeeper not found');
    }

    const updatedShopkeeper = await this.prisma.shopkeeper.update({
      where: { id },
      data: updateShopkeeperDto,
    });

    const { password: _, ...result } = updatedShopkeeper;
    return result;
  }

  async remove(id: string): Promise<void> {
    const existingShopkeeper = await this.prisma.shopkeeper.findUnique({
      where: { id },
    });

    if (!existingShopkeeper) {
      throw new NotFoundException('Shopkeeper not found');
    }

    await this.prisma.shopkeeper.delete({
      where: { id },
    });
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
