import { IsString, IsOptional } from 'class-validator';

export class AcceptExportRequestDto {
  @IsString()
  @IsOptional()
  message?: string;
}
