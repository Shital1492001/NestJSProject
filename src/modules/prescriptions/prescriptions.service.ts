import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prescription } from '../../database/entities/prescription.entity';
import { Appointment } from '../../database/entities/appointment.entity';
import { UserRole } from '../../database/entities/user.entity';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { PaginationUtil, PaginationResponse } from '../../common/utils/pagination.util';

@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectRepository(Prescription)
    private prescriptionRepository: Repository<Prescription>,
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
  ) {}

  async create(
    createPrescriptionDto: CreatePrescriptionDto,
    userId: number,
    userRole: UserRole,
  ) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: createPrescriptionDto.appointmentId },
      relations: ['doctor', 'doctor.user'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (userRole !== UserRole.ADMIN && appointment.doctor.user.id !== userId) {
      throw new ForbiddenException('Only the doctor can create prescriptions for their appointments');
    }

    const prescription = this.prescriptionRepository.create({
      ...createPrescriptionDto,
      appointment,
    });

    await this.prescriptionRepository.save(prescription);

    return {
      message: 'Prescription created successfully',
      data: prescription,
    };
  }

  async findAll(
    paginationParams: any,
  ): Promise<PaginationResponse<Prescription>> {
    const { skip, take, order } = PaginationUtil.getPaginationParams(paginationParams);

    const [data, total] = await this.prescriptionRepository.findAndCount({
      skip,
      take,
      order,
      relations: ['appointment', 'appointment.doctor', 'appointment.doctor.user', 'appointment.patient', 'appointment.patient.user'],
    });

    return PaginationUtil.createPaginationResponse(data, total, paginationParams.page || 1, take);
  }

  async findOne(id: number) {
    const prescription = await this.prescriptionRepository.findOne({
      where: { id },
      relations: ['appointment', 'appointment.doctor', 'appointment.doctor.user', 'appointment.patient', 'appointment.patient.user'],
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    return {
      message: 'Prescription retrieved successfully',
      data: prescription,
    };
  }

  async update(
    id: number,
    updatePrescriptionDto: UpdatePrescriptionDto,
    userId: number,
    userRole: UserRole,
  ) {
    const prescription = await this.prescriptionRepository.findOne({
      where: { id },
      relations: ['appointment', 'appointment.doctor', 'appointment.doctor.user'],
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    if (userRole !== UserRole.ADMIN && prescription.appointment.doctor.user.id !== userId) {
      throw new ForbiddenException('Only the doctor can update their prescriptions');
    }

    await this.prescriptionRepository.update(id, updatePrescriptionDto);

    const updatedPrescription = await this.prescriptionRepository.findOne({
      where: { id },
      relations: ['appointment', 'appointment.doctor', 'appointment.doctor.user', 'appointment.patient', 'appointment.patient.user'],
    });

    return {
      message: 'Prescription updated successfully',
      data: updatedPrescription,
    };
  }

  async download(id: number, userId: number, userRole: UserRole) {
    const prescription = await this.prescriptionRepository.findOne({
      where: { id },
      relations: ['appointment', 'appointment.doctor', 'appointment.doctor.user', 'appointment.patient', 'appointment.patient.user'],
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    if (userRole !== UserRole.ADMIN && 
        prescription.appointment.doctor.user.id !== userId && 
        prescription.appointment.patient.user.id !== userId) {
      throw new ForbiddenException('You can only download prescriptions you are associated with');
    }

    return {
      message: 'Prescription data retrieved for download',
      data: prescription,
    };
  }
}
