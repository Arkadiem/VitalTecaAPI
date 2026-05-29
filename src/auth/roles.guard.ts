import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { Role } from '../common/enums/role.enum';

interface RequestUser {
  userId: string;
  email: string;
  role: Role;
  isEmployee: boolean;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const request: { user?: RequestUser } = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) return false;

    return requiredRoles.includes(user.role);
  }
}
