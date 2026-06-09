import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from '../../database/entities/doctor.entity';
import { User } from '../../database/entities/user.entity';
import { UserRole } from '../../database/entities/user.entity';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { SearchDoctorDto } from './dto/search-doctor.dto';
import { PaginationUtil, PaginationResponse } from '../../common/utils/pagination.util';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  async create(
    createDoctorDto: CreateDoctorDto,
    userId: number,
    userRole: UserRole,
  ) {
    if (userRole !== UserRole.ADMIN && userRole !== UserRole.DOCTOR) {
      throw new ForbiddenException('Only admins and doctors can create doctor profiles');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // if (user.role !== UserRole.DOCTOR) {
    //   throw new ForbiddenException('User must be a doctor to create a doctor profile');
    // }

    const existingDoctor = await this.doctorRepository.findOne({
      where: { user: { id: userId } },
    });

    if (existingDoctor) {
      throw new ForbiddenException('Doctor profile already exists for this user');
    }

    const doctor = this.doctorRepository.create({
      ...createDoctorDto,
      user,
    });

    await this.doctorRepository.save(doctor);

    return {
      message: 'Doctor profile created successfully',
      data: doctor,
    };
  }

  async findAll(
    paginationParams: any,
  ): Promise<PaginationResponse<Doctor>> {
    const { skip, take, order } = PaginationUtil.getPaginationParams(paginationParams);

    const [data, total] = await this.doctorRepository.findAndCount({
      skip,
      take,
      order,
      relations: ['user', 'department'],
    });

    return PaginationUtil.createPaginationResponse(data, total, paginationParams.page || 1, take);
  }

  async findOne(id: number) {
    const doctor = await this.doctorRepository.findOne({
      where: { id },
      relations: ['user', 'department'],
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return {
      message: 'Doctor retrieved successfully',
      data: doctor,
    };
  }

  async search(searchDoctorDto: SearchDoctorDto) {
    const queryBuilder = this.doctorRepository
      .createQueryBuilder('doctor')
      .leftJoinAndSelect('doctor.user', 'user')
      .leftJoinAndSelect('doctor.department', 'department');

    if (searchDoctorDto.specialization) {
      queryBuilder.andWhere('doctor.specialization LIKE :specialization', {
        specialization: `%${searchDoctorDto.specialization}%`,
      });
    }

    const doctors = await queryBuilder.getMany();

    return {
      message: 'Doctors retrieved successfully',
      data: doctors,
    };
  }

  async update(
    id: number,
    updateDoctorDto: UpdateDoctorDto,
    userId: number,
    userRole: UserRole,
  ) {
    const doctor = await this.doctorRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    if (userRole !== UserRole.ADMIN && doctor.user.id !== userId) {
      throw new ForbiddenException('You can only update your own profile');
    }

    await this.doctorRepository.update(id, updateDoctorDto);

    const updatedDoctor = await this.doctorRepository.findOne({
      where: { id },
      relations: ['user', 'department'],
    });

    return {
      message: 'Doctor updated successfully',
      data: updatedDoctor,
    };
  }

  async remove(id: number, userRole: UserRole) {
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can delete doctors');
    }

    const doctor = await this.doctorRepository.findOne({
      where: { id },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    await this.doctorRepository.softRemove(doctor);

    return {
      message: 'Doctor deleted successfully',
    };
  }

  async uploadImage(id: number, imageUrl: string, userId: number, userRole: UserRole) {
    const doctor = await this.doctorRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    if (userRole !== UserRole.ADMIN && doctor.user.id !== userId) {
      throw new ForbiddenException('You can only upload images to your own profile');
    }

    await this.doctorRepository.update(id, { image: imageUrl });

    const updatedDoctor = await this.doctorRepository.findOne({
      where: { id },
    });

    return {
      message: 'Doctor image uploaded successfully',
      data: updatedDoctor,
    };
  }
}
