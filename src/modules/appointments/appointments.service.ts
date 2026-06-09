import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Appointment } from '../../database/entities/appointment.entity';
import { Doctor } from '../../database/entities/doctor.entity';
import { Patient } from '../../database/entities/patient.entity';
import { UserRole } from '../../database/entities/user.entity';
import { AppointmentStatus } from '../../database/entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { PaginationUtil, PaginationResponse } from '../../common/utils/pagination.util';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
  ) {}

  async create(
    createAppointmentDto: CreateAppointmentDto,
    userId: number,
    userRole: UserRole,
  ) {
    const doctor = await this.doctorRepository.findOne({
      where: { id: createAppointmentDto.doctorId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const patient = await this.patientRepository.findOne({
      where: { id: createAppointmentDto.patientId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    if (userRole !== UserRole.ADMIN && patient.user.id !== userId) {
      throw new ForbiddenException('You can only book appointments for yourself');
    }

    const existingAppointment = await this.appointmentRepository.findOne({
      where: {
        doctor: { id: createAppointmentDto.doctorId },
        appointmentDate: new Date(createAppointmentDto.appointmentDate),
        appointmentTime: createAppointmentDto.appointmentTime,
        status: AppointmentStatus.CONFIRMED,
      },
    });

    if (existingAppointment) {
      throw new BadRequestException('Doctor is not available at this time');
    }

    const appointment = this.appointmentRepository.create({
      ...createAppointmentDto,
      appointmentDate: new Date(createAppointmentDto.appointmentDate),
      doctor,
      patient,
      status: AppointmentStatus.PENDING,
    });

    await this.appointmentRepository.save(appointment);

    return {
      message: 'Appointment booked successfully',
      data: appointment,
    };
  }

  async findAll(
    paginationParams: any,
  ): Promise<PaginationResponse<Appointment>> {
    const { skip, take, order } = PaginationUtil.getPaginationParams(paginationParams);

    const [data, total] = await this.appointmentRepository.findAndCount({
      skip,
      take,
      order,
      relations: ['doctor', 'doctor.user', 'patient', 'patient.user'],
    });

    return PaginationUtil.createPaginationResponse(data, total, paginationParams.page || 1, take);
  }

  async findOne(id: number) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['doctor', 'doctor.user', 'patient', 'patient.user', 'prescriptions'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return {
      message: 'Appointment retrieved successfully',
      data: appointment,
    };
  }

  async checkAvailability(doctorId: number, date: string) {
    const appointments = await this.appointmentRepository.find({
      where: {
        doctor: { id: doctorId },
        appointmentDate: new Date(date),
        status: AppointmentStatus.CONFIRMED,
      },
    });

    const bookedTimes = appointments.map((app) => app.appointmentTime);

    return {
      message: 'Doctor availability retrieved successfully',
      data: {
        doctorId,
        date,
        bookedTimes,
        available: true,
      },
    };
  }

  async update(
    id: number,
    updateAppointmentDto: UpdateAppointmentDto,
    userId: number,
    userRole: UserRole,
  ) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['doctor', 'patient'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (userRole !== UserRole.ADMIN && appointment.patient.user.id !== userId) {
      throw new ForbiddenException('You can only update your own appointments');
    }

    if (updateAppointmentDto.status === AppointmentStatus.CANCELLED) {
      if (userRole !== UserRole.ADMIN && appointment.patient.user.id !== userId) {
        throw new ForbiddenException('You can only cancel your own appointments');
      }
    }

    await this.appointmentRepository.update(id, updateAppointmentDto);

    const updatedAppointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['doctor', 'doctor.user', 'patient', 'patient.user'],
    });

    return {
      message: 'Appointment updated successfully',
      data: updatedAppointment,
    };
  }

  async cancel(id: number, userId: number, userRole: UserRole) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['patient'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (userRole !== UserRole.ADMIN && appointment.patient.user.id !== userId) {
      throw new ForbiddenException('You can only cancel your own appointments');
    }

    await this.appointmentRepository.update(id, {
      status: AppointmentStatus.CANCELLED,
    });

    return {
      message: 'Appointment cancelled successfully',
    };
  }

  async getHistory(
    userId: number,
    userRole: UserRole,
    paginationParams: any,
  ): Promise<PaginationResponse<Appointment>> {
    const { skip, take, order } = PaginationUtil.getPaginationParams(paginationParams);

    let queryBuilder = this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.doctor', 'doctor')
      .leftJoinAndSelect('doctor.user', 'doctorUser')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('patient.user', 'patientUser')
      .skip(skip)
      .take(take)
      .orderBy('appointment.appointmentDate', order.createdAt || 'DESC');

    if (userRole === UserRole.PATIENT) {
      queryBuilder = queryBuilder.andWhere('patient.user.id = :userId', { userId });
    } else if (userRole === UserRole.DOCTOR) {
      queryBuilder = queryBuilder.andWhere('doctor.user.id = :userId', { userId });
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    return PaginationUtil.createPaginationResponse(data, total, paginationParams.page || 1, take);
  }
}
