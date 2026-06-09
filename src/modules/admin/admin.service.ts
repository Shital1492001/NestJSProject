import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { Doctor } from '../../database/entities/doctor.entity';
import { Patient } from '../../database/entities/patient.entity';
import { Appointment } from '../../database/entities/appointment.entity';
import { Department } from '../../database/entities/department.entity';
import { Prescription } from '../../database/entities/prescription.entity';
import { UserRole } from '../../database/entities/user.entity';
import { AppointmentStatus } from '../../database/entities/appointment.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
    @InjectRepository(Prescription)
    private prescriptionRepository: Repository<Prescription>,
  ) {}

  async getDashboardStatistics() {
    const totalUsers = await this.userRepository.count();
    const totalDoctors = await this.doctorRepository.count();
    const totalPatients = await this.patientRepository.count();
    const totalAppointments = await this.appointmentRepository.count();
    const totalDepartments = await this.departmentRepository.count();
    const totalPrescriptions = await this.prescriptionRepository.count();

    const pendingAppointments = await this.appointmentRepository.count({
      where: { status: AppointmentStatus.PENDING },
    });

    const confirmedAppointments = await this.appointmentRepository.count({
      where: { status: AppointmentStatus.CONFIRMED },
    });

    const completedAppointments = await this.appointmentRepository.count({
      where: { status: AppointmentStatus.COMPLETED },
    });

    const cancelledAppointments = await this.appointmentRepository.count({
      where: { status: AppointmentStatus.CANCELLED },
    });

    const doctorsByRole = await this.userRepository.count({
      where: { role: UserRole.DOCTOR },
    });

    const patientsByRole = await this.userRepository.count({
      where: { role: UserRole.PATIENT },
    });

    const adminsByRole = await this.userRepository.count({
      where: { role: UserRole.ADMIN },
    });

    return {
      message: 'Dashboard statistics retrieved successfully',
      data: {
        users: {
          total: totalUsers,
          doctors: doctorsByRole,
          patients: patientsByRole,
          admins: adminsByRole,
        },
        doctors: totalDoctors,
        patients: totalPatients,
        appointments: {
          total: totalAppointments,
          pending: pendingAppointments,
          confirmed: confirmedAppointments,
          completed: completedAppointments,
          cancelled: cancelledAppointments,
        },
        departments: totalDepartments,
        prescriptions: totalPrescriptions,
      },
    };
  }

  async getDoctorManagement(paginationParams: any) {
    const page = paginationParams.page || 1;
    const limit = paginationParams.limit || 10;
    const skip = (page - 1) * limit;

    const [doctors, total] = await this.doctorRepository.findAndCount({
      skip,
      take: limit,
      relations: ['user', 'department'],
      order: { createdAt: 'DESC' },
    });

    return {
      message: 'Doctor management data retrieved successfully',
      data: {
        doctors,
        meta: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async getPatientManagement(paginationParams: any) {
    const page = paginationParams.page || 1;
    const limit = paginationParams.limit || 10;
    const skip = (page - 1) * limit;

    const [patients, total] = await this.patientRepository.findAndCount({
      skip,
      take: limit,
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    return {
      message: 'Patient management data retrieved successfully',
      data: {
        patients,
        meta: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async getAppointmentReports(paginationParams: any) {
    const page = paginationParams.page || 1;
    const limit = paginationParams.limit || 10;
    const skip = (page - 1) * limit;

    const [appointments, total] = await this.appointmentRepository.findAndCount({
      skip,
      take: limit,
      relations: ['doctor', 'doctor.user', 'patient', 'patient.user'],
      order: { appointmentDate: 'DESC' },
    });

    return {
      message: 'Appointment reports retrieved successfully',
      data: {
        appointments,
        meta: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }
}
