import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../../database/entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { PaginationUtil, PaginationResponse } from '../../common/utils/pagination.util';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto) {
    const existingDepartment = await this.departmentRepository.findOne({
      where: { name: createDepartmentDto.name },
    });

    if (existingDepartment) {
      throw new ConflictException('Department with this name already exists');
    }

    const department = this.departmentRepository.create(createDepartmentDto);
    await this.departmentRepository.save(department);

    return {
      message: 'Department created successfully',
      data: department,
    };
  }

  async findAll(
    paginationParams: any,
  ): Promise<PaginationResponse<Department>> {
    const { skip, take, order } = PaginationUtil.getPaginationParams(paginationParams);

    const [data, total] = await this.departmentRepository.findAndCount({
      skip,
      take,
      order,
      relations: ['doctors'],
    });

    return PaginationUtil.createPaginationResponse(data, total, paginationParams.page || 1, take);
  }

  async findOne(id: number) {
    const department = await this.departmentRepository.findOne({
      where: { id },
      relations: ['doctors', 'doctors.user'],
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return {
      message: 'Department retrieved successfully',
      data: department,
    };
  }

  async update(id: number, updateDepartmentDto: UpdateDepartmentDto) {
    const department = await this.departmentRepository.findOne({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    if (updateDepartmentDto.name && updateDepartmentDto.name !== department.name) {
      const existingDepartment = await this.departmentRepository.findOne({
        where: { name: updateDepartmentDto.name },
      });

      if (existingDepartment) {
        throw new ConflictException('Department with this name already exists');
      }
    }

    await this.departmentRepository.update(id, updateDepartmentDto);

    const updatedDepartment = await this.departmentRepository.findOne({
      where: { id },
    });

    return {
      message: 'Department updated successfully',
      data: updatedDepartment,
    };
  }

  async remove(id: number) {
    const department = await this.departmentRepository.findOne({
      where: { id },
      relations: ['doctors'],
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    if (department.doctors && department.doctors.length > 0) {
      throw new ForbiddenException('Cannot delete department with associated doctors');
    }

    department.isDeleted = true;
    await this.departmentRepository.save(department);
    await this.departmentRepository.softRemove(department);

    return {
      message: 'Department deleted successfully',
    };
  }
}
