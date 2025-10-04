import { Expose, Type } from 'class-transformer';
import { CategoryDto } from 'src/categories/dtos/category.dto';

export class ProductDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  price: number;

  @Expose()
  quantity: number;

  @Expose()
  image_url: string;

  @Expose()
  @Type(() => CategoryDto)
  category: CategoryDto;
}
