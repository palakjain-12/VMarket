// backend/src/export-request/dto/reject-export-request.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class RejectExportRequestDto {
  @IsString()
  @IsOptional()
  message?: string;
}
