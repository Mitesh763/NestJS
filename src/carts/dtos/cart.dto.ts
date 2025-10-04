import { Expose, Type } from 'class-transformer';
import { ProductDto } from 'src/products/dtos/product.dto';
import { UserDto } from 'src/users/dtos/user.dto';

export class CartDto {
  @Expose()
  id: number;

  @Expose()
  @Type(() => UserDto)
  user: UserDto;

  @Expose()
  @Type(() => ProductDto)
  product: ProductDto;

  @Expose()
  quantity: number;
}
