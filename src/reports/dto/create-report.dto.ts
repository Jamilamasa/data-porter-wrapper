import { IsString, IsDateString, IsBoolean, IsOptional } from 'class-validator';

export class CreateReportDto {
  @IsOptional()
  @IsString()
  account_id: string;

  @IsString()
  table_name: string;

  @IsDateString()
  date_from: string;

  @IsDateString()
  date_to: string;

  @IsOptional()
  @IsBoolean()
  force_refresh?: boolean;
}
