import { Expose, Transform, Type } from 'class-transformer';
import { ProductDto } from 'src/products/dtos/product.dto';

export class OrderItemDto {
  @Expose()
  id: number;

  @Expose()
  quantity: number;

  @Expose()
  created_at: Date;

  @Expose()
  updated_at: Date;

  @Expose()
  @Type(() => ProductDto)
  product: ProductDto;
}
