import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateOrderItemDto {
  @IsNumber()
  @IsOptional()
  @Min(1)
  quantity: number;
}
