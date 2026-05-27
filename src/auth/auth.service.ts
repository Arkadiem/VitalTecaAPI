import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EmployeesService } from '../employees/employees.service';
import * as bcrypt from 'bcryptjs';

export interface ValidatedUser {
  id: string;
  email: string;
  name: string;
  isEmployee: boolean;
  authRole: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private employeesService: EmployeesService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<ValidatedUser | null> {
    const employee = await this.employeesService.findByEmail(email);
    if (employee) {
      const isMatch = await bcrypt.compare(pass, employee.password);
      if (isMatch) {
        const { password, ...result } = employee;
        return { ...result, isEmployee: true, authRole: employee.role };
      }
    }

    const user = await this.usersService.findByEmail(email);
    if (user) {
      if (!user.isActive) throw new UnauthorizedException('User account is inactive');
      const isMatch = await bcrypt.compare(pass, user.password);
      if (isMatch) {
        const { password, ...result } = user;
        return { ...result, isEmployee: false, authRole: 'USER' };
      }
    }

    return null;
  }

  async login(user: ValidatedUser): Promise<LoginResponse> {
    const payload = { email: user.email, sub: user.id, role: user.authRole };
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
