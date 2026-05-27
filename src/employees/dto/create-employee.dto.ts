import { IsEmail, IsNotEmpty, IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmployeeDto {
  @ApiProperty()
  @IsString() 
  @IsNotEmpty() 
  name: string;
  
  @ApiProperty()
  @IsEmail() 
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
  
  @ApiProperty({ required: false, default: 'LIBRARIAN' })
  @IsString() 
  @IsOptional() 
  role?: string;
}
