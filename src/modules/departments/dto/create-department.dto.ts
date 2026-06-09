import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Cardiology' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Department for heart-related treatments', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
