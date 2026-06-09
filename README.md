# 🏥 Hospital Management System REST API

A production-ready Hospital Management System REST API built with NestJS, TypeScript, MySQL, and TypeORM following industry-standard architecture and best practices.

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Roles and Permissions](#roles-and-permissions)
- [Best Practices](#best-practices)

## ✨ Features

- **User Authentication**: JWT-based authentication with role-based access control
- **Doctor Management**: Complete CRUD operations for doctors with image upload
- **Patient Management**: Patient profiles with medical history tracking
- **Department Management**: Hospital department organization
- **Appointment System**: Book, manage, and track appointments
- **Prescription Management**: Create and manage prescriptions
- **Admin Dashboard**: Statistics and management reports
- **File Upload**: Support for doctor image uploads
- **Pagination**: Built-in pagination for list endpoints
- **Search APIs**: Search functionality for doctors and patients
- **Soft Delete**: Data integrity with soft delete functionality
- **API Documentation**: Interactive Swagger documentation
- **Rate Limiting**: Built-in rate limiting for API protection
- **Global Validation**: Request validation with class-validator
- **Error Handling**: Centralized error handling with custom filters

## 🛠 Technology Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: MySQL
- **ORM**: TypeORM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Validation**: class-validator, class-transformer
- **File Upload**: Multer
- **API Documentation**: Swagger/OpenAPI
- **Rate Limiting**: @nestjs/throttler

## 📦 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MySQL (v8.0 or higher)

## 🚀 Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd hospital-management-system
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Copy the `.env.example` file to `.env` and update the values:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=hospital_management

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# Swagger
SWAGGER_TITLE=Hospital Management System API
SWAGGER_DESCRIPTION=Production-ready Hospital Management System REST API
SWAGGER_VERSION=1.0
```

4. **Create the database**

```sql
CREATE DATABASE hospital_management;
```

5. **Run the application**

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## ⚙️ Configuration

### Database Configuration

The application uses TypeORM with MySQL. Configure your database settings in the `.env` file:

- `DB_HOST`: Database host (default: localhost)
- `DB_PORT`: Database port (default: 3306)
- `DB_USERNAME`: Database username
- `DB_PASSWORD`: Database password
- `DB_DATABASE`: Database name

### JWT Configuration

- `JWT_SECRET`: Secret key for JWT token signing
- `JWT_EXPIRES_IN`: Token expiration time (default: 7d)

### File Upload Configuration

- `UPLOAD_DIR`: Directory for uploaded files (default: ./uploads)
- `MAX_FILE_SIZE`: Maximum file size in bytes (default: 5MB)

## 🏃 Running the Application

### Development Mode

```bash
npm run start:dev
```

The application will start on `http://localhost:3000`

### Production Mode

```bash
npm run build
npm run start:prod
```

### API Documentation

Once the application is running, access the Swagger documentation at:

```
http://localhost:3000/api/docs
```

## 📁 Project Structure

```
src/
│
├── common/
│   ├── decorators/       # Custom decorators (@Roles, @CurrentUser, @Public)
│   ├── guards/           # Guards (JwtAuthGuard, RolesGuard)
│   ├── interceptors/     # Interceptors (LoggingInterceptor, ResponseInterceptor)
│   ├── filters/          # Exception filters (GlobalExceptionFilter)
│   ├── pipes/            # Custom pipes (ValidationPipe, ParseIntPipe, TrimPipe)
│   └── utils/            # Utility functions (PaginationUtil)
│
├── config/
│   ├── database.config.ts    # Database configuration
│   ├── jwt.config.ts        # JWT configuration
│   ├── app.config.ts        # App configuration
│   └── swagger.config.ts    # Swagger configuration
│
├── database/
│   ├── entities/            # TypeORM entities
│   │   ├── base.entity.ts
│   │   ├── user.entity.ts
│   │   ├── doctor.entity.ts
│   │   ├── patient.entity.ts
│   │   ├── department.entity.ts
│   │   ├── appointment.entity.ts
│   │   └── prescription.entity.ts
│   └── repositories/        # Custom repositories (if needed)
│
├── modules/
│   ├── auth/                # Authentication module
│   │   ├── dto/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── doctors/             # Doctor module
│   ├── patients/            # Patient module
│   ├── departments/         # Department module
│   ├── appointments/        # Appointment module
│   ├── prescriptions/       # Prescription module
│   └── admin/               # Admin module
│
├── app.module.ts            # Root module
└── main.ts                  # Application entry point
```

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/register` | Register a new user | No |
| POST | `/api/v1/auth/login` | Login user | No |
| POST | `/api/v1/auth/change-password` | Change password | Yes |

### Doctors

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/api/v1/doctors` | Create doctor profile | Yes | ADMIN, DOCTOR |
| GET | `/api/v1/doctors` | Get all doctors | Yes | All |
| GET | `/api/v1/doctors/search` | Search doctors | Yes | All |
| GET | `/api/v1/doctors/:id` | Get doctor by ID | Yes | All |
| PATCH | `/api/v1/doctors/:id` | Update doctor | Yes | ADMIN, DOCTOR (own) |
| DELETE | `/api/v1/doctors/:id` | Delete doctor | Yes | ADMIN |
| POST | `/api/v1/doctors/:id/upload-image` | Upload doctor image | Yes | ADMIN, DOCTOR (own) |

### Patients

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/api/v1/patients` | Create patient profile | Yes | ADMIN, PATIENT |
| GET | `/api/v1/patients` | Get all patients | Yes | All |
| GET | `/api/v1/patients/search` | Search patients | Yes | All |
| GET | `/api/v1/patients/:id` | Get patient by ID | Yes | All |
| GET | `/api/v1/patients/:id/history` | Get patient history | Yes | ADMIN, PATIENT (own) |
| PATCH | `/api/v1/patients/:id` | Update patient | Yes | ADMIN, PATIENT (own) |
| DELETE | `/api/v1/patients/:id` | Delete patient | Yes | ADMIN |

### Departments

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/api/v1/departments` | Create department | Yes | ADMIN |
| GET | `/api/v1/departments` | Get all departments | Yes | All |
| GET | `/api/v1/departments/:id` | Get department by ID | Yes | All |
| PATCH | `/api/v1/departments/:id` | Update department | Yes | ADMIN |
| DELETE | `/api/v1/departments/:id` | Delete department | Yes | ADMIN |

### Appointments

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/api/v1/appointments` | Book appointment | Yes | ADMIN, PATIENT |
| GET | `/api/v1/appointments` | Get all appointments | Yes | All |
| GET | `/api/v1/appointments/history` | Get appointment history | Yes | All |
| GET | `/api/v1/appointments/check-availability/:doctorId/:date` | Check doctor availability | Yes | All |
| GET | `/api/v1/appointments/:id` | Get appointment by ID | Yes | All |
| PATCH | `/api/v1/appointments/:id` | Update appointment | Yes | ADMIN, PATIENT (own) |
| PATCH | `/api/v1/appointments/:id/cancel` | Cancel appointment | Yes | ADMIN, PATIENT (own) |

### Prescriptions

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/api/v1/prescriptions` | Create prescription | Yes | ADMIN, DOCTOR |
| GET | `/api/v1/prescriptions` | Get all prescriptions | Yes | All |
| GET | `/api/v1/prescriptions/:id` | Get prescription by ID | Yes | All |
| GET | `/api/v1/prescriptions/:id/download` | Download prescription | Yes | ADMIN, DOCTOR (own), PATIENT (own) |
| PATCH | `/api/v1/prescriptions/:id` | Update prescription | Yes | ADMIN, DOCTOR (own) |

### Admin

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/api/v1/admin/dashboard` | Get dashboard statistics | Yes | ADMIN |
| GET | `/api/v1/admin/doctors` | Get doctor management data | Yes | ADMIN |
| GET | `/api/v1/admin/patients` | Get patient management data | Yes | ADMIN |
| GET | `/api/v1/admin/appointments` | Get appointment reports | Yes | ADMIN |

## 🔐 Authentication

### Register

```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "Password123!",
  "role": "PATIENT"
}
```

### Login

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "Password123!"
}
```

Response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "PATIENT"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Using the Token

Include the JWT token in the Authorization header:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 👥 Roles and Permissions

### ADMIN

- Full access to all endpoints
- Manage users, doctors, patients, departments
- View dashboard statistics
- Delete any resource

### DOCTOR

- Create and update own doctor profile
- Create and update prescriptions
- View own appointment history
- Upload own profile image

### PATIENT

- Create and update own patient profile
- Book appointments
- View own appointment history
- View own prescriptions
- Cancel own appointments

## 🏆 Best Practices

### SOLID Principles

- **Single Responsibility**: Each module has a single responsibility
- **Open/Closed**: Modules are open for extension, closed for modification
- **Liskov Substitution**: Entities can be substituted with their subtypes
- **Interface Segregation**: Small, focused interfaces
- **Dependency Inversion**: Depend on abstractions, not concretions

### Repository Pattern

- All database operations go through repositories
- Services use repositories for data access
- Separation of business logic from data access

### TypeORM Relations

- Proper entity relationships defined
- Lazy loading for performance
- Cascading deletes for data integrity

### Error Handling

- Global exception filter for consistent error responses
- Custom exceptions for specific error cases
- Proper HTTP status codes

### Validation

- Request DTOs validated with class-validator
- Global validation pipe
- Custom validators for complex validation

### Security

- JWT authentication
- Role-based access control
- Password hashing with bcrypt
- Rate limiting for API protection

### Pagination

- Consistent pagination across all list endpoints
- Configurable page size and sorting
- Metadata in response for pagination info

## 📝 API Testing Examples

### Using cURL

```bash
# Register a new user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "password": "Password123!",
    "role": "PATIENT"
  }'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "Password123!"
  }'

# Get all doctors (with token)
curl -X GET http://localhost:3000/api/v1/doctors \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Postman

1. Import the API collection
2. Set up environment variables
3. Use the login endpoint to get the JWT token
4. Add the token to the Authorization header
5. Test the endpoints

## 🐛 Troubleshooting

### Database Connection Issues

- Ensure MySQL is running
- Check database credentials in `.env`
- Verify database exists

### JWT Token Issues

- Check JWT_SECRET in `.env`
- Ensure token is not expired
- Verify token format in Authorization header

### File Upload Issues

- Ensure uploads directory exists
- Check file size limits
- Verify file types are allowed

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Support

For support and questions, please open an issue in the repository.
