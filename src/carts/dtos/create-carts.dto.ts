import { Type } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';

export class CreateCartDto {
  @Type(() => Number)
  @IsNumber()
  productId: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity: number;
}
