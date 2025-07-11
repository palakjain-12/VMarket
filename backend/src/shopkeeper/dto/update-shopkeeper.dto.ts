import { PartialType } from '@nestjs/mapped-types';
import { CreateShopkeeperDto } from './create-shopkeeper.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateShopkeeperDto extends PartialType(CreateShopkeeperDto) {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  shopName?: string;

  @IsOptional()
  @IsString()
  address?: string;
}