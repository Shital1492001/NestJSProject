import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../../database/entities/patient.entity';
import { User } from '../../database/entities/user.entity';
import { UserRole } from '../../database/entities/user.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { SearchPatientDto } from './dto/search-patient.dto';
import { PaginationUtil, PaginationResponse } from '../../common/utils/pagination.util';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  async create(
    createPatientDto: CreatePatientDto,
    userId: number,
    userRole: UserRole,
  ) {
    if (userRole !== UserRole.ADMIN && userRole !== UserRole.PATIENT) {
      throw new ForbiddenException('Only admins and patients can create patient profiles');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // if (user.role !== UserRole.PATIENT) {
    //   throw new ForbiddenException('User must be a patient to create a patient profile');
    // }

    const existingPatient = await this.patientRepository.findOne({
      where: { user: { id: userId } },
    });

    if (existingPatient) {
      throw new ForbiddenException('Patient profile already exists for this user');
    }

    const patient = this.patientRepository.create({
      ...createPatientDto,
      user,
    });

    await this.patientRepository.save(patient);

    return {
      message: 'Patient profile created successfully',
      data: patient,
    };
  }

  async findAll(
    paginationParams: any,
  ): Promise<PaginationResponse<Patient>> {
    const { skip, take, order } = PaginationUtil.getPaginationParams(paginationParams);

    const [data, total] = await this.patientRepository.findAndCount({
      skip,
      take,
      order,
      relations: ['user'],
    });

    return PaginationUtil.createPaginationResponse(data, total, paginationParams.page || 1, take);
  }

  async findOne(id: number) {
    const patient = await this.patientRepository.findOne({
      where: { id },
      relations: ['user', 'appointments'],
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return {
      message: 'Patient retrieved successfully',
      data: patient,
    };
  }

  async search(searchPatientDto: SearchPatientDto) {
    const queryBuilder = this.patientRepository
      .createQueryBuilder('patient')
      .leftJoinAndSelect('patient.user', 'user');

    if (searchPatientDto.firstName) {
      queryBuilder.andWhere('user.firstName LIKE :firstName', {
        firstName: `%${searchPatientDto.firstName}%`,
      });
    }

    if (searchPatientDto.lastName) {
      queryBuilder.andWhere('user.lastName LIKE :lastName', {
        lastName: `%${searchPatientDto.lastName}%`,
      });
    }

    const patients = await queryBuilder.getMany();

    return {
      message: 'Patients retrieved successfully',
      data: patients,
    };
  }

  async getHistory(id: number, userId: number, userRole: UserRole) {
    const patient = await this.patientRepository.findOne({
      where: { id },
      relations: ['user', 'appointments', 'appointments.doctor', 'appointments.doctor.user', 'appointments.prescriptions'],
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    if (userRole !== UserRole.ADMIN && patient.user.id !== userId) {
      throw new ForbiddenException('You can only view your own history');
    }

    return {
      message: 'Patient history retrieved successfully',
      data: patient,
    };
  }

  async update(
    id: number,
    updatePatientDto: UpdatePatientDto,
    userId: number,
    userRole: UserRole,
  ) {
    const patient = await this.patientRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    if (userRole !== UserRole.ADMIN && patient.user.id !== userId) {
      throw new ForbiddenException('You can only update your own profile');
    }

    await this.patientRepository.update(id, updatePatientDto);

    const updatedPatient = await this.patientRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    return {
      message: 'Patient updated successfully',
      data: updatedPatient,
    };
  }

  async remove(id: number, userRole: UserRole) {
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can delete patients');
    }

    const patient = await this.patientRepository.findOne({
      where: { id },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    patient.isDeleted = true;
    await this.patientRepository.save(patient);
    await this.patientRepository.softRemove(patient);

    return {
      message: 'Patient deleted successfully',
    };
  }
}
