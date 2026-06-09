import { IsString, IsInt, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDoctorDto {
  @ApiProperty({ example: 'Cardiology' })
  @IsString()
  @IsNotEmpty()
  specialization: string;

  @ApiProperty({ example: 10 })
  @IsInt()
  @IsNotEmpty()
  experience: number;

  @ApiProperty({ example: 500.00 })
  @IsNumber()
  @IsNotEmpty()
  consultationFee: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  departmentId?: number;
}
