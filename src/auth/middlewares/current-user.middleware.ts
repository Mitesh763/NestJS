import { Injectable, NestMiddleware } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  constructor(private readonly userService: UsersService) {}
  async use(req: any, res: any, next: (error?: any) => void) {
    const { userId } = req.session || {};

    if (userId) {
      const currentUser = await this.userService.findOneById(userId);
      if (currentUser) {
        const { password, ...user } = currentUser;
        req.user = user;
      }
    }

    next();
  }
}
