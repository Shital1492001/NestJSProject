import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../database/entities/user.entity';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getDashboardStatistics() {
    return this.adminService.getDashboardStatistics();
  }

  @Get('doctors')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get doctor management data' })
  async getDoctorManagement(@Query() query: any) {
    return this.adminService.getDoctorManagement(query);
  }

  @Get('patients')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get patient management data' })
  async getPatientManagement(@Query() query: any) {
    return this.adminService.getPatientManagement(query);
  }

  @Get('appointments')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get appointment reports' })
  async getAppointmentReports(@Query() query: any) {
    return this.adminService.getAppointmentReports(query);
  }
}
