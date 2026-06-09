import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../database/entities/user.entity';

@ApiTags('Appointments')
@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.PATIENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Book a new appointment' })
  async create(@Body() createAppointmentDto: CreateAppointmentDto, @Request() req) {
    return this.appointmentsService.create(createAppointmentDto, req.user.sub, req.user.role);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all appointments with pagination' })
  async findAll(@Query() query: any) {
    return this.appointmentsService.findAll(query);
  }

  @Get('history')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get appointment history' })
  async getHistory(@Request() req, @Query() query: any) {
    return this.appointmentsService.getHistory(req.user.sub, req.user.role, query);
  }

  @Get('check-availability/:doctorId/:date')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Check doctor availability' })
  async checkAvailability(@Param('doctorId') doctorId: string, @Param('date') date: string) {
    return this.appointmentsService.checkAvailability(+doctorId, date);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get appointment by ID' })
  async findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(+id);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update appointment' })
  async update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @Request() req,
  ) {
    return this.appointmentsService.update(+id, updateAppointmentDto, req.user.sub, req.user.role);
  }

  @Patch(':id/cancel')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cancel appointment' })
  async cancel(@Param('id') id: string, @Request() req) {
    return this.appointmentsService.cancel(+id, req.user.sub, req.user.role);
  }
}
