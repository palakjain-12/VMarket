import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  /* ------------------------------------------------------------------ */
  /*  CREATE                                                            */
  /* ------------------------------------------------------------------ */
  async create(createProductDto: CreateProductDto & { shopkeeperId: string }) {
    try {
      const product = await this.prisma.product.create({
        data: {
          name: createProductDto.name,
          description: createProductDto.description,
          price: createProductDto.price,
          quantity: createProductDto.quantity,
          category: createProductDto.category,
          expiryDate: createProductDto.expiryDate
            ? new Date(createProductDto.expiryDate)
            : null,
          shopkeeperId: createProductDto.shopkeeperId,
        },
        include: {
          shopkeeper: {
            select: { id: true, name: true, shopName: true },
          },
        },
      });
      return product;
    } catch (error) {
      console.error('❌ Product creation failed:', error);
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to create product',
      );
    }
  }

  /* ------------------------------------------------------------------ */
  /*  READ – PUBLIC LIST                                                */
  /* ------------------------------------------------------------------ */
  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        skip,
        take: limit,
        where: { quantity: { gt: 0 } },
        include: {
          shopkeeper: { select: { id: true, name: true, shopName: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where: { quantity: { gt: 0 } } }),
    ]);

    // Get all pending export requests for these products
    const productIds = products.map((product) => product.id);
    const pendingExportRequests = await this.prisma.exportRequest.findMany({
      where: {
        productId: { in: productIds },
        status: 'PENDING',
      },
      select: {
        productId: true,
        quantity: true,
      },
    });

    // Create a map of product ID to pending quantity
    const pendingQuantityMap = {};
    pendingExportRequests.forEach((request) => {
      if (!pendingQuantityMap[request.productId]) {
        pendingQuantityMap[request.productId] = 0;
      }
      pendingQuantityMap[request.productId] += request.quantity;
    });

    // Add available quantity to each product
    const productsWithAvailableQuantity = products.map((product) => ({
      ...product,
      availableQuantity: Math.max(
        0,
        product.quantity - (pendingQuantityMap[product.id] || 0),
      ),
    }));

    // Remove the debug logging as it's no longer needed
    // The issue is not with missing products, but with how we're fetching them

    return {
      data: productsWithAvailableQuantity,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /* ------------------------------------------------------------------ */
  /*  READ – SINGLE ITEM                                                */
  /* ------------------------------------------------------------------ */
  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        shopkeeper: {
          select: {
            id: true,
            name: true,
            shopName: true,
            email: true,
            phone: true,
          },
        },
      },
    });
    if (!product) throw new NotFoundException('Product not found');

    // Get pending export requests for this product to calculate actual available quantity
    const pendingExportRequests = await this.prisma.exportRequest.findMany({
      where: {
        productId: id,
        status: 'PENDING',
      },
      select: {
        quantity: true,
      },
    });

    // Calculate total quantity in pending export requests
    const pendingQuantity = pendingExportRequests.reduce(
      (total, request) => total + request.quantity,
      0,
    );

    // Create a new product object with the available quantity
    const productWithAvailableQuantity = {
      ...product,
      availableQuantity: Math.max(0, product.quantity - pendingQuantity),
    };

    return productWithAvailableQuantity;
  }

  /* ------------------------------------------------------------------ */
  /*  READ – BY SHOPKEEPER                                              */
  /* ------------------------------------------------------------------ */
  async findByShopkeeper(shopkeeperId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        skip,
        take: limit,
        where: { shopkeeperId },
        include: {
          shopkeeper: { select: { id: true, name: true, shopName: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where: { shopkeeperId } }),
    ]);

    // We don't need to fetch accepted export requests separately
    // The products should already be in the shop's inventory when an export request is accepted

    // Get all pending export requests for these products
    const productIds = products.map((product) => product.id);
    const pendingExportRequests = await this.prisma.exportRequest.findMany({
      where: {
        productId: { in: productIds },
        status: 'PENDING',
      },
      select: {
        productId: true,
        quantity: true,
      },
    });

    // Create a map of product ID to pending quantity
    const pendingQuantityMap = {};
    pendingExportRequests.forEach((request) => {
      if (!pendingQuantityMap[request.productId]) {
        pendingQuantityMap[request.productId] = 0;
      }
      pendingQuantityMap[request.productId] += request.quantity;
    });

    // Add available quantity to each product
    const productsWithAvailableQuantity = products.map((product) => ({
      ...product,
      availableQuantity: Math.max(
        0,
        product.quantity - (pendingQuantityMap[product.id] || 0),
      ),
    }));

    return {
      data: productsWithAvailableQuantity,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /* ------------------------------------------------------------------ */
  /*  UPDATE                                                            */
  /* ------------------------------------------------------------------ */
  async update(id: string, updateDto: UpdateProductDto) {
    try {
      const product = await this.prisma.product.update({
        where: { id },
        data: {
          ...(updateDto.name && { name: updateDto.name }),
          ...(updateDto.description && { description: updateDto.description }),
          ...(updateDto.price && { price: updateDto.price }),
          ...(updateDto.quantity !== undefined && {
            quantity: updateDto.quantity,
          }),
          ...(updateDto.category && { category: updateDto.category }),
          ...(updateDto.expiryDate && {
            expiryDate: new Date(updateDto.expiryDate),
          }),
          updatedAt: new Date(),
        },
        include: {
          shopkeeper: { select: { id: true, name: true, shopName: true } },
        },
      });
      return product;
    } catch {
      throw new BadRequestException('Failed to update product');
    }
  }

  /* ------------------------------------------------------------------ */
  /*  DELETE                                                            */
  /* ------------------------------------------------------------------ */
  async remove(id: string) {
    try {
      await this.prisma.product.delete({ where: { id } });
      return { message: 'Product deleted successfully' };
    } catch {
      throw new BadRequestException('Failed to delete product');
    }
  }

  /* ------------------------------------------------------------------ */
  /*  SEARCH                                                            */
  /* ------------------------------------------------------------------ */
  async searchProducts(query: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    // Remove 'as const' to make it mutable for Prisma
    const searchWhere = {
      AND: [
        { quantity: { gt: 0 } },
        {
          OR: [
            { name: { contains: query, mode: 'insensitive' as const } },
            { description: { contains: query, mode: 'insensitive' as const } },
            { category: { contains: query, mode: 'insensitive' as const } },
          ],
        },
      ],
    };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        skip,
        take: limit,
        where: searchWhere,
        include: {
          shopkeeper: { select: { id: true, name: true, shopName: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where: searchWhere }),
    ]);

    return {
      data: products,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /* ------------------------------------------------------------------ */
  /*  FILTER BY CATEGORY                                                */
  /* ------------------------------------------------------------------ */
  async findByCategory(category: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    // Remove 'as const' to make it mutable for Prisma
    const filter = {
      category: { equals: category, mode: 'insensitive' as const },
      quantity: { gt: 0 },
    };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        skip,
        take: limit,
        where: filter,
        include: {
          shopkeeper: { select: { id: true, name: true, shopName: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where: filter }),
    ]);

    return {
      data: products,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /* ------------------------------------------------------------------ */
  /*  UPDATE QUANTITY                                                   */
  /* ------------------------------------------------------------------ */
  async updateQuantity(id: string, quantity: number) {
    try {
      const product = await this.prisma.product.update({
        where: { id },
        data: { quantity, updatedAt: new Date() },
        include: {
          shopkeeper: { select: { id: true, name: true, shopName: true } },
        },
      });
      return product;
    } catch {
      throw new BadRequestException('Failed to update product quantity');
    }
  }

  /* ------------------------------------------------------------------ */
  /*  EXPIRING PRODUCTS                                                 */
  /* ------------------------------------------------------------------ */
  async findExpiringProducts(days = 7, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    // Remove 'as const' to make it mutable for Prisma
    const filter = {
      expiryDate: { lte: futureDate, gte: new Date() },
      quantity: { gt: 0 },
    };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        skip,
        take: limit,
        where: filter,
        include: {
          shopkeeper: { select: { id: true, name: true, shopName: true } },
        },
        orderBy: { expiryDate: 'asc' },
      }),
      this.prisma.product.count({ where: filter }),
    ]);

    return {
      data: products,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
