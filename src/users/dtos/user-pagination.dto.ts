import { Expose, Type } from 'class-transformer';
import { UserDto } from './user.dto';

export class MetaDto {
  @Expose()
  itemsPerPage: number;

  @Expose()
  totalItems: number;

  @Expose()
  currentPage: number;

  @Expose()
  totalPages: number;

  @Expose()
  sortBy: string[];
}

export class LinkDto {
  @Expose()
  current: string;

  @Expose()
  next: string;

  @Expose()
  last: string;
}

export class UserPaginationDto {
  @Expose()
  @Type(() => UserDto)
  data: UserDto[];

  @Expose()
  @Type(() => MetaDto)
  meta: MetaDto;

  @Expose()
  @Type(() => LinkDto)
  links: LinkDto;
}
