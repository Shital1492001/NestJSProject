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
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { SearchPatientDto } from './dto/search-patient.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../database/entities/user.entity';

@ApiTags('Patients')
@Controller('patients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.PATIENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new patient profile' })
  async create(@Body() createPatientDto: CreatePatientDto, @Request() req) {
    return this.patientsService.create(createPatientDto, req.user.sub, req.user.role);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all patients with pagination' })
  async findAll(@Query() query: any) {
    return this.patientsService.findAll(query);
  }

  @Get('search')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Search patients by name' })
  async search(@Query() searchPatientDto: SearchPatientDto) {
    return this.patientsService.search(searchPatientDto);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get patient by ID' })
  async findOne(@Param('id') id: string) {
    return this.patientsService.findOne(+id);
  }

  @Get(':id/history')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get patient history' })
  async getHistory(@Param('id') id: string, @Request() req) {
    return this.patientsService.getHistory(+id, req.user.sub, req.user.role);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update patient profile' })
  async update(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
    @Request() req,
  ) {
    return this.patientsService.update(+id, updatePatientDto, req.user.sub, req.user.role);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete patient' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.patientsService.remove(+id, req.user.role);
  }
}
