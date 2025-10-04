import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { roleEnum } from '../../users/user.entity';

@Injectable()
export class AdminRoleGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const user = request.currentUser;

    if (user && user.role === roleEnum.ADMIN) return true;
    else return false;
  }
}
