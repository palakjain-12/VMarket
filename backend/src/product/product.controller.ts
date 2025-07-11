// backend/src/product/product.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  create(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser() user: any,
  ) {
    return this.productService.create(createProductDto, user.id);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.productService.findAll(paginationDto);
  }

  @Get('search')
  searchProducts(
    @Query('q') query: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.productService.searchProducts(query, paginationDto);
  }

  @Get('expiring-soon')
  findExpiringSoon(@Query('days') days?: string) {
    const daysNumber = days ? parseInt(days, 10) : 7;
    return this.productService.findExpiringSoon(daysNumber);
  }

  @Get('my-products')
  findMyProducts(
    @CurrentUser() user: any,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.productService.findByShopkeeper(user.id, paginationDto);
  }

  @Get('shop/:shopkeeperId')
  findByShopkeeper(
    @Param('shopkeeperId') shopkeeperId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.productService.findByShopkeeper(shopkeeperId, paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() user: any,
  ) {
    return this.productService.update(id, updateProductDto, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.productService.remove(id, user.id);
  }
}