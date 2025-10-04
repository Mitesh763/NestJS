import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  price: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  quantity: number;

  @IsString()
  @IsOptional()
  image_url: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  categoryId: number;
}
