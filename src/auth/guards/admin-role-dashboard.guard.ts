import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { roleEnum } from '../../users/user.entity';

@Injectable()
export class AdminRoleGuardDashboard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const user = request.user;

    if (user && user.role === roleEnum.ADMIN) return true;
    else {
      response.redirect('/auth/user');
      return false;
    }
  }
}
