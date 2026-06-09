import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { User } from '../../database/entities/user.entity';
import { Doctor } from '../../database/entities/doctor.entity';
import { Patient } from '../../database/entities/patient.entity';
import { Appointment } from '../../database/entities/appointment.entity';
import { Department } from '../../database/entities/department.entity';
import { Prescription } from '../../database/entities/prescription.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Doctor,
      Patient,
      Appointment,
      Department,
      Prescription,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
