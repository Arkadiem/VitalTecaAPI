import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EmployeesService } from '../employees/employees.service';
import { Role } from '../common/enums/role.enum';
import * as bcrypt from 'bcryptjs';

export interface ValidatedUser {
  id: string;
  email: string;
  name: string;
  isEmployee: boolean;
  authRole: Role;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: Role;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private employeesService: EmployeesService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<ValidatedUser | null> {
    // Buscar primero en empleados (prioridad)
    const employee = await this.employeesService.findByEmail(email);
    if (employee) {
      const isMatch = await bcrypt.compare(pass, employee.password);
      if (isMatch) {
        const { password: _, ...result } = employee;
        return { ...result, isEmployee: true, authRole: employee.role as Role };
      }
    }

    // Luego buscar en usuarios (clientes)
    const user = await this.usersService.findByEmail(email);
    if (user) {
      if (!user.isActive)
        throw new UnauthorizedException('User account is inactive');
      const isMatch = await bcrypt.compare(pass, user.password);
      if (isMatch) {
        const { password: _, ...result } = user;
        return { ...result, isEmployee: false, authRole: user.role as Role };
      }
    }

    return null;
  }

  login(user: ValidatedUser): LoginResponse {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.authRole,
      isEmployee: user.isEmployee,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.authRole,
      },
    };
  }
}
