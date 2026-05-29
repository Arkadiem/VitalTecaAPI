import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Role } from '../enums/role.enum';

interface RequestUser {
  userId: string;
  email: string;
  role: Role;
  isEmployee: boolean;
}

interface RequestWithUser extends Request {
  user: RequestUser;
  params: { id: string };
}

@Injectable()
export class OwnershipGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    // ADMIN y EMPLOYEE pueden acceder a cualquier recurso
    if (user.role === Role.ADMIN || user.role === Role.EMPLOYEE) {
      return true;
    }

    // CLIENT solo puede acceder a sus propios recursos
    const resourceId = request.params.id;
    if (user.userId !== resourceId) {
      throw new ForbiddenException(
        'Solo puedes acceder a tus propios recursos',
      );
    }

    return true;
  }
}
