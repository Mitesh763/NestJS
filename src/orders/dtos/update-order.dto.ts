import { IsEnum } from 'class-validator';
import { OrderStatus } from '../orders.entity';

export class UpdateOrderDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
