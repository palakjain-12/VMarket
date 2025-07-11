// backend/src/product/product.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto, shopkeeperId: string): Promise<Product> {
    const { expiryDate, ...productData } = createProductDto;

    return this.prisma.product.create({
      data: {
        ...productData,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        shopkeeperId,
      },
      include: {
        shopkeeper: {
          select: {
            id: true,
            name: true,
            shopName: true,
            address: true,
          },
        },
      },
    });
  }

  async findAll(paginationDto: PaginationDto): Promise<{
    data: Product[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { skip, take } = paginationDto;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        skip,
        take,
        include: {
          shopkeeper: {
            select: {
              id: true,
              name: true,
              shopName: true,
              address: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.product.count(),
    ]);

    return {
      data: products,
      total,
      page: paginationDto.page ?? 1,
      limit: paginationDto.limit ?? 10,
    };
  }

  async findByShopkeeper(shopkeeperId: string, paginationDto: PaginationDto): Promise<{
    data: Product[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { skip, take } = paginationDto;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where: { shopkeeperId },
        skip,
        take,
        include: {
          shopkeeper: {
            select: {
              id: true,
              name: true,
              shopName: true,
              address: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.product.count({
        where: { shopkeeperId },
      }),
    ]);

    return {
      data: products,
      total,
      page: paginationDto.page ?? 1,
      limit: paginationDto.limit ?? 10,
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        shopkeeper: {
          select: {
            id: true,
            name: true,
            shopName: true,
            address: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, userId: string): Promise<Product> {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    // Check if user owns this product
    if (existingProduct.shopkeeperId !== userId) {
      throw new ForbiddenException('You can only update your own products');
    }

    const { expiryDate, ...productData } = updateProductDto;

    return this.prisma.product.update({
      where: { id },
      data: {
        ...productData,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      },
      include: {
        shopkeeper: {
          select: {
            id: true,
            name: true,
            shopName: true,
            address: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    // Check if user owns this product
    if (existingProduct.shopkeeperId !== userId) {
      throw new ForbiddenException('You can only delete your own products');
    }

    await this.prisma.product.delete({
      where: { id },
    });
  }

  async findExpiringSoon(days: number = 7): Promise<Product[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.prisma.product.findMany({
      where: {
        expiryDate: {
          lte: futureDate,
          gte: new Date(),
        },
        quantity: {
          gt: 0,
        },
      },
      include: {
        shopkeeper: {
          select: {
            id: true,
            name: true,
            shopName: true,
            address: true,
          },
        },
      },
      orderBy: {
        expiryDate: 'asc',
      },
    });
  }

  async searchProducts(query: string, paginationDto: PaginationDto): Promise<{
    data: Product[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { skip, take } = paginationDto;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { category: { contains: query, mode: 'insensitive' } },
          ],
        },
        skip,
        take,
        include: {
          shopkeeper: {
            select: {
              id: true,
              name: true,
              shopName: true,
              address: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.product.count({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { category: { contains: query, mode: 'insensitive' } },
          ],
        },
      }),
    ]);

    return {
      data: products,
      total,
      page: paginationDto.page ?? 1,
      limit: paginationDto.limit ?? 10,
    };
  }
}