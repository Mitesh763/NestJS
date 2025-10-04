import { IsNumber, Min } from 'class-validator';

export class CreateOrderItemDto {
  @IsNumber()
  orderId: number;
}
