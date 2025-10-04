import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class UpdateAddressDto {
  @IsString()
  @IsOptional()
  address_line_1: string;

  @IsString()
  @IsOptional()
  address_line_2: string;

  @IsString()
  @IsOptional()
  city: string;

  @IsString()
  @IsOptional()
  country: string;

  @Type(() => Number)
  @IsNumber()
  @Min(100000)
  @Max(999999)
  @IsOptional()
  postal_code: number;
}
