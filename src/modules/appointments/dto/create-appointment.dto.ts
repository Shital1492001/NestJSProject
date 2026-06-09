import { IsDateString, IsString, IsInt, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class CreateAppointmentDto {
  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  @IsNotEmpty()
  appointmentDate: string;

  @ApiProperty({ example: '10:00' })
  @IsString()
  @IsNotEmpty()
  appointmentTime: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  doctorId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  patientId: number;

  @ApiProperty({ example: 'Regular checkup', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
