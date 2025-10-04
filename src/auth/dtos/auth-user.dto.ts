import { Expose, Type } from 'class-transformer';

export class AuthUserDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  phone_number: string;

  @Expose()
  role: string;

  @Expose()
  profile: string;

  @Expose()
  @Type(() => Date)
  expired_at: Date;

  @Expose()
  accessToken: string;
}
