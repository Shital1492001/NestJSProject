import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchDoctorDto {
  @ApiProperty({ example: 'Cardiology', required: false })
  @IsOptional()
  @IsString()
  specialization?: string;
}
