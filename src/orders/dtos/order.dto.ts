import { Expose, Type } from 'class-transformer';
import { AddressDto } from 'src/address/dtos/address.dto';
import { OrderItemDto } from 'src/order-items/dtos/orderItem.dto';
import { UserDto } from 'src/users/dtos/user.dto';

export class OrderDto {
  @Expose()
  id: number;

  @Expose()
  total_price: string;

  @Expose()
  status: string;

  @Expose()
  @Type(() => UserDto)
  user: UserDto;

  @Expose()
  @Type(() => AddressDto)
  address: AddressDto;

  @Expose()
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
