import { IsString, IsArray, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePrescriptionDto {
  @ApiProperty({ example: 'Acute bronchitis' })
  @IsString()
  @IsNotEmpty()
  diagnosis: string;

  @ApiProperty({
    example: [
      { name: 'Amoxicillin', dosage: '500mg', frequency: '3 times a day', duration: '7 days' }
    ],
    type: 'array'
  })
  @IsArray()
  @IsNotEmpty()
  medicines: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;

  @ApiProperty({ example: 'Complete the full course of antibiotics', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  appointmentId: number;
}
