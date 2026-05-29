import { IsNotEmpty, IsString, IsInt, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookDto {
  @ApiProperty({ example: 'Cien Años de Soledad' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Gabriel García Márquez' })
  @IsString()
  @IsNotEmpty()
  author: string;

  @ApiProperty({ example: '978-0307474728' })
  @IsString()
  @IsNotEmpty()
  isbn: string;

  @ApiProperty({ required: false, default: 0, example: 10 })
  @IsInt()
  @Min(0)
  @IsOptional()
  stock?: number;
}
