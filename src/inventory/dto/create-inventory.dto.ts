import { IsNotEmpty, IsString, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInventoryDto {
  @ApiProperty({ description: 'ID del libro a inventariar' })
  @IsUUID() @IsNotEmpty() bookId: string;

  @ApiProperty({ description: 'ID del empleado que realiza la revisión' })
  @IsUUID() @IsNotEmpty() employeeId: string;

  @ApiProperty({ required: false, default: 'GOOD', enum: ['GOOD', 'DAMAGED', 'LOST'] })
  @IsString() @IsOptional() status?: string;
}
