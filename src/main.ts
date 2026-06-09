import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { JwtService } from '@nestjs/jwt';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const reflector = app.get(Reflector);
  const jwtService = app.get(JwtService);

  // Global prefix
  const apiPrefix = configService.get<string>('app.apiPrefix') || 'api';
  app.setGlobalPrefix(apiPrefix);

  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global interceptors
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Global filters
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global guards (with reflector for @Public decorator)
  app.useGlobalGuards(new JwtAuthGuard(jwtService, reflector));
  app.useGlobalGuards(new RolesGuard(reflector));

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle(configService.get<string>('swagger.title') || 'Hospital Management System API')
    .setDescription(
      configService.get<string>('swagger.description') ||
        'Production-ready Hospital Management System REST API',
    )
    .setVersion(configService.get<string>('swagger.version') || '1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'User authentication and authorization endpoints')
    .addTag('Doctors', 'Doctor management endpoints')
    .addTag('Patients', 'Patient management endpoints')
    .addTag('Departments', 'Department management endpoints')
    .addTag('Appointments', 'Appointment booking and management endpoints')
    .addTag('Prescriptions', 'Prescription management endpoints')
    .addTag('Admin', 'Admin dashboard and management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Hospital Management API Docs',
  });

  // Start server
  const port = configService.get<number>('app.port') || 3000;
  await app.listen(port);

  console.log(`
    ============================================
    🏥 Hospital Management System API
    ============================================
    
    🚀 Server running on: http://localhost:${port}
    📚 API Documentation: http://localhost:${port}/api/docs
    🌐 API Prefix: /${apiPrefix}
    
    Environment: ${configService.get<string>('app.nodeEnv')}
    ============================================
  `);
}

bootstrap();
