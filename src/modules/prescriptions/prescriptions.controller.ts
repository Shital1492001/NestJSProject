import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../database/entities/user.entity';

@ApiTags('Prescriptions')
@Controller('prescriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) { }

  @Post()
  @Roles(UserRole.DOCTOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new prescription' })
  async create(@Body() createPrescriptionDto: CreatePrescriptionDto, @Request() req) {
    return this.prescriptionsService.create(createPrescriptionDto, req.user.sub, req.user.role);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all prescriptions with pagination' })
  async findAll(@Query() query: any) {
    return this.prescriptionsService.findAll(query);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get prescription by ID' })
  async findOne(@Param('id') id: string) {
    return this.prescriptionsService.findOne(+id);
  }

  @Get(':id/download')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Download prescription' })
  async download(@Param('id') id: string, @Request() req) {
    return this.prescriptionsService.download(+id, req.user.sub, req.user.role);
  }

  @Patch(':id')
  @Roles(UserRole.DOCTOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update prescription' })
  async update(
    @Param('id') id: string,
    @Body() updatePrescriptionDto: UpdatePrescriptionDto,
    @Request() req,
  ) {
    return this.prescriptionsService.update(+id, updatePrescriptionDto, req.user.sub, req.user.role);
  }
}
