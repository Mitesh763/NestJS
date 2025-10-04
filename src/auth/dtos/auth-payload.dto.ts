import { IsEmail, IsStrongPassword } from 'class-validator';

export class authPayloadDto {
  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;
}
