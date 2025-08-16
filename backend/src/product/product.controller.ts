// src/product/product.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

interface JwtPayload {
  email: string;
  sub: number;
  shopName: string;
}

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser() user: JwtPayload,
  ) {
    // Add the shopkeeper ID from the authenticated user
    const productData = {
      ...createProductDto,
      shopkeeperId: user.sub.toString(),
    };
    return this.productService.create(productData);
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.productService.findAll(paginationDto);
  }

  @Get('my-products')
  async findMyProducts(
    @CurrentUser() user: JwtPayload,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.productService.findByShopkeeper(
      user.sub.toString(),
      paginationDto,
    );
  }

  @Get('shop/:shopId')
  async findByShop(
    @Param('shopId') shopId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    // Fixed: Use shopId as string, not number
    return this.productService.findByShopkeeper(shopId, paginationDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    // Fixed: Use id as string, not number
    const product = await this.productService.findOne(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() user: JwtPayload,
  ) {
    // Fixed: Use id as string, not number
    // Verify the product belongs to the authenticated user
    const product = await this.productService.findOne(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.shopkeeperId !== user.sub.toString()) {
      throw new BadRequestException('You can only update your own products');
    }

    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    // Fixed: Use id as string, not number
    // Verify the product belongs to the authenticated user
    const product = await this.productService.findOne(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.shopkeeperId !== user.sub.toString()) {
      throw new BadRequestException('You can only delete your own products');
    }

    return this.productService.remove(id);
  }

  @Get('search/:query')
  async searchProducts(
    @Param('query') query: string,
    @Query() paginationDto: PaginationDto,
  ) {
    if (!query || query.trim().length === 0) {
      throw new BadRequestException('Search query cannot be empty');
    }
    return this.productService.searchProducts(query, paginationDto);
  }

  @Get('category/:category')
  async findByCategory(
    @Param('category') category: string,
    @Query() paginationDto: PaginationDto,
  ) {
    if (!category || category.trim().length === 0) {
      throw new BadRequestException('Category cannot be empty');
    }
    return this.productService.findByCategory(category, paginationDto);
  }

  @Patch(':id/quantity')
  async updateQuantity(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
    @CurrentUser() user: JwtPayload,
  ) {
    // Fixed: Use id as string, not number
    if (quantity < 0) {
      throw new BadRequestException('Quantity cannot be negative');
    }

    // Verify the product belongs to the authenticated user
    const product = await this.productService.findOne(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.shopkeeperId !== user.sub.toString()) {
      throw new BadRequestException('You can only update your own products');
    }

    return this.productService.updateQuantity(id, quantity);
  }
}
