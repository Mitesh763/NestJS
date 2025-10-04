import { Expose, Type } from 'class-transformer';
import { ProductDto } from './product.dto';
import { LinkDto, MetaDto } from 'src/users/dtos/user-pagination.dto';

export class ProductPaginationDto {
  @Expose()
  @Type(() => ProductDto)
  data: ProductDto[];

  @Expose()
  @Type(() => MetaDto)
  meta: MetaDto;

  @Expose()
  @Type(() => LinkDto)
  links: LinkDto;
}
