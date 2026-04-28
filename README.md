# Hospital Management System (HMS)

A full-stack hospital management system built with Spring Boot and React for managing patients, doctors, appointments, medical records, and billing.

## Tech Stack

### Backend
- **Framework:** Spring Boot 3.2.3
- **Language:** Java 17+
- **Database:** H2 (In-memory)
- **Authentication:** JWT (JSON Web Tokens)
- **Security:** Spring Security 6
- **ORM:** Spring Data JPA / Hibernate
- **API Documentation:** SpringDoc OpenAPI (Swagger)
- **Real-time:** WebSocket (STOMP)

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite 8
- **Routing:** React Router DOM 7
- **HTTP Client:** Axios
- **Charts:** Recharts
- **Icons:** React Icons (Heroicons)
- **Styling:** Custom CSS with Modern UI

## Features

### Authentication
- JWT-based authentication
- Role-based access control (ADMIN, DOCTOR, RECEPTIONIST, PATIENT)
- Secure password hashing with BCrypt

### User Management
- User registration and login
- Role-based permissions
- Account status management

### Doctor Management
- Doctor profiles with specialization
- Availability scheduling
- Consultation fee tracking

### Patient Management
- Patient registration
- Medical history tracking
- Personal information management
- Patient list accessible to Admin only

### Appointments
- Online appointment booking
- Appointment status tracking (SCHEDULED, CONFIRMED, COMPLETED, CANCELLED)
- Doctor availability checking

### Medical Records
- Doctor notes and prescriptions
- Patient medical history
- Record management by authorized staff

### Billing
- Bill generation for appointments
- Multiple charge categories (consultation, treatment, medication, lab tests)
- Payment tracking
- Payment history

### Dashboard
- Dashboard with statistics
- Revenue analysis
- Appointment trends

## Project Structure

```
hospital-management-system/
├── hms-backend/              # Spring Boot Backend
│   ├── src/main/java/com/hms/
│   │   ├── config/         # Configuration classes
│   │   ├── controller/     # REST API controllers
│   │   ├── dto/           # Data Transfer Objects
│   │   ├── exception/      # Exception handlers
│   │   ├── model/          # Entity models
│   │   ├── repository/    # JPA repositories
│   │   ├── service/       # Business logic
│   │   └── util/          # Utilities
│   └── pom.xml
│
└── hms-frontend/           # React Frontend
    ├── src/
    │   ├── components/    # Reusable components
    │   ├── context/        # React contexts
    │   ├── pages/         # Page components
    │   ├── services/      # API services
    │   └── App.jsx       # Main app component
    ├── package.json
    └── vite.config.js
```

## Role-Based Access Control

| Feature | Admin | Doctor | Receptionist | Patient |
|---------|-------|--------|-------------|---------|
| Dashboard | ✓ | ✓ | ✓ | ✓ |
| Doctors | ✓ | ✓ | ✓ | ✗ |
| Patients | ✓ | ✗ | ✓ | ✗ |
| Appointments | ✓ | ✓ | ✓ | ✓ |
| Medical Records | ✓ | ✓ | ✓ | ✓ |
| Billing | ✓ | ✗ | ✓ | ✗ |
| User Management | ✓ | ✗ | ✗ | ✗ |

## Getting Started

### Prerequisites
- Java 17 or higher
- Node.js 18 or higher
- Maven 3.9+

### Backend Setup

1. Navigate to the backend directory:
```bash
cd hms-backend
```

2. Run the backend:
```bash
# Windows
mvnw.cmd spring-boot:run

# Linux/Mac
./mvnw spring-boot:run
```

The backend will start on **http://localhost:8081/api**

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd hms-frontend
```

2. Install dependencies (first time only):
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will start on **http://localhost:5173**

## Running Both Servers

Open two separate terminals:

**Terminal 1 - Backend:**
```bash
cd hms-backend
mvnw.cmd spring-boot:run
```

**Terminal 2 - Frontend:**
```bash
cd hms-frontend
npm install  # only first time
npm run dev
```

Then open **http://localhost:5173** in your browser.

## Demo Credentials

After starting the application, sample data is initialized automatically:

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Receptionist | receptionist | recep123 |
| Doctor | dr.rajesh | doctor123 |
| Patient | rahul | patient123 |

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/change-password` - Change password
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/{id}` - Get user by ID
- `PUT /api/users/{id}` - Update user
- `PATCH /api/users/{id}/toggle-status` - Toggle user status

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/search?name=` - Search doctors
- `GET /api/doctors/specializations` - Get all specializations
- `POST /api/doctors` - Create doctor (Admin/Receptionist)
- `PUT /api/doctors/{id}` - Update doctor

### Patients
- `GET /api/patients` - Get all patients (Admin/Receptionist/Doctor)
- `GET /api/patients/search?name=` - Search patients
- `POST /api/patients` - Create patient
- `PUT /api/patients/{id}` - Update patient

### Appointments
- `GET /api/appointments` - Get all appointments
- `POST /api/appointments` - Create appointment
- `PATCH /api/appointments/{id}/status` - Update appointment status
- `DELETE /api/appointments/{id}` - Cancel appointment

### Medical Records
- `GET /api/medical-records/patient/{id}` - Get patient records
- `POST /api/medical-records` - Create medical record (Doctor only)
- `PUT /api/medical-records/{id}` - Update medical record

### Bills
- `GET /api/bills` - Get all bills (Admin/Receptionist)
- `GET /api/bills/status/{status}` - Get bills by status
- `POST /api/bills` - Generate bill (Admin/Receptionist)
- `POST /api/bills/{id}/payments` - Record payment (Admin/Receptionist)

### Dashboard
- `GET /api/dashboard/admin` - Admin dashboard statistics

## Building for Production

### Backend
```bash
cd hms-backend
mvnw.cmd clean package
java -jar target/hms-backend-1.0.0.jar
```

### Frontend
```bash
cd hms-frontend
npm run build
```

The built files will be in the `dist` folder.

## Configuration

### Backend Configuration
Edit `src/main/resources/application.properties` to modify:
- Server port
- Database settings
- JWT secret and expiration
- CORS settings

### Frontend Configuration
Edit `src/services/api.js` to change the API base URL if needed:
```javascript
const API_BASE_URL = 'http://localhost:8081/api/';
```

## Quick Access Demo

On the login page, you can click on the demo credential cards to quickly fill in the username and password, then click "Sign In" to login.

## License

This project is for educational purposes.
