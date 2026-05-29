import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLoanDto {
  @ApiProperty({ description: 'ID del libro a prestar' })
  @IsUUID()
  @IsNotEmpty()
  bookId: string;

  @ApiProperty({ description: 'ID del usuario que solicita el préstamo' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'ID del empleado que gestiona el préstamo' })
  @IsUUID()
  @IsNotEmpty()
  employeeId: string;
}
