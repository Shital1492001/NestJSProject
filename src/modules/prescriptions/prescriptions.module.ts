import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrescriptionsService } from './prescriptions.service';
import { PrescriptionsController } from './prescriptions.controller';
import { Prescription } from '../../database/entities/prescription.entity';
import { Appointment } from '../../database/entities/appointment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Prescription, Appointment])],
  controllers: [PrescriptionsController],
  providers: [PrescriptionsService],
  exports: [PrescriptionsService],
})
export class PrescriptionsModule {}
