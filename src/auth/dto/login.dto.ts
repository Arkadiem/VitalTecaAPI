import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'admin@biblioteca.com',
    description: 'Email del usuario o empleado',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'admin123', description: 'Contraseña' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
