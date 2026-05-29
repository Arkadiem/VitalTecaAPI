import { PartialType } from '@nestjs/swagger';
import { CreateLoanDto } from './create-loan.dto';
import { IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateLoanDto extends PartialType(CreateLoanDto) {
  @ApiProperty({
    required: false,
    description: 'Fecha de devolución en ISO 8601',
  })
  @IsDateString()
  @IsOptional()
  returnDate?: string | Date;
}
