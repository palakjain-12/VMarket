// backend/src/product/dto/create-product.dto.ts
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsDateString, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @IsString()
  @IsOptional()
  category?: string;
}

// backend/src/product/dto/update-product.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}

// backend/src/product/dto/product-response.dto.ts
export class ProductResponseDto {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  expiryDate?: Date;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
  shopkeeperId: string;
  shopkeeper: {
    id: string;
    name: string;
    shopName: string;
    address: string;
  };
}