import { IsNotEmpty, IsUUID, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { InventoryStatus } from '../../common/enums/inventory-status.enum';

export class CreateInventoryDto {
  @ApiProperty({ description: 'ID del libro a inventariar' })
  @IsUUID()
  @IsNotEmpty()
  bookId: string;

  @ApiProperty({ description: 'ID del empleado que realiza la revisión' })
  @IsUUID()
  @IsNotEmpty()
  employeeId: string;

  @ApiProperty({
    required: false,
    default: InventoryStatus.GOOD,
    enum: InventoryStatus,
  })
  @IsEnum(InventoryStatus)
  @IsOptional()
  status?: InventoryStatus;
}
