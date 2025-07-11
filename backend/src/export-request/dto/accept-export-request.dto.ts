// backend/src/export-request/dto/accept-export-request.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class AcceptExportRequestDto {
  @IsString()
  @IsOptional()
  message?: string;
}

