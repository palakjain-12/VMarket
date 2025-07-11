// backend/src/export-request/dto/create-export-request.dto.ts
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExportRequestDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  toShopId: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsString()
  @IsOptional()
  message?: string;
}

// backend/src/export-request/dto/update-export-request.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateExportRequestDto } from './create-export-request.dto';

export class UpdateExportRequestDto extends PartialType(CreateExportRequestDto) {}

// backend/src/export-request/dto/accept-export-request.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class AcceptExportRequestDto {
  @IsString()
  @IsOptional()
  message?: string;
}

// backend/src/export-request/dto/reject-export-request.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class RejectExportRequestDto {
  @IsString()
  @IsOptional()
  message?: string;
}