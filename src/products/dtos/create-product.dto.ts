import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @Type(() => Number)
  @IsNumber()
  price: number;

  @Type(() => Number)
  @IsNumber()
  quantity: number;

  @IsString()
  image_url: string;

  @Type(() => Number)
  @IsNumber()
  categoryId: number;
}
