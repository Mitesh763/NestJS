import { IsDate, IsNumber, IsString } from 'class-validator';
import { User } from 'src/users/user.entity';
import { ManyToOne } from 'typeorm';

export class CreateTokenDto {
  @ManyToOne(() => User)
  user: User;

  @IsString()
  token: string;

  @IsDate()
  expired_at: Date;
}
