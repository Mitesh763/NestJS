import { Expose, Transform } from 'class-transformer';

export class AddressDto {
  @Expose()
  id: string;

  @Expose()
  address_line_1: string;

  @Expose()
  address_line_2: string;

  @Expose()
  city: string;

  @Expose()
  isDefault: string;

  @Expose()
  country: string;

  @Expose()
  postal_code: number;

  // @Expose()
  // @Transform(({ obj }) => obj.user.id)
  // userUId: number;
}
