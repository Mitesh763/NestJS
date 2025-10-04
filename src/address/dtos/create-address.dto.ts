import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  address_line_1: string;

  @IsString()
  @IsOptional()
  address_line_2: string;

  @IsString()
  city: string;

  @IsString()
  country: string;

  @Type(() => Number)
  @IsNumber()
  @Min(100000)
  @Max(999999)
  postal_code: number;
}
