import { registerAs } from '@nestjs/config';

export const swaggerConfig = registerAs('swagger', () => ({
  title: process.env.SWAGGER_TITLE || 'Hospital Management System API',
  description:
    process.env.SWAGGER_DESCRIPTION ||
    'Production-ready Hospital Management System REST API',
  version: process.env.SWAGGER_VERSION || '1.0',
}));
