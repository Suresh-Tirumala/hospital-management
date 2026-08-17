# Hospital Management System

A full-stack Hospital Management System for managing hospital operations, patient care workflows, and AI-assisted healthcare education. The project combines a Spring Boot REST API with a React/Vite frontend and includes role-based access for admins, doctors, receptionists, and patients.

## Project Overview

This application is designed as an end-to-end HMS platform. It supports daily hospital administration such as doctor and patient management, appointments, medical records, billing, dashboards, and user access control. It also includes an AI medical assistant module for healthcare education and rehabilitation guidance.

The backend exposes secured REST APIs using JWT authentication and Spring Security. The frontend provides a protected React dashboard experience with route-level permissions, real-time support, charts, and an AI chat assistant.

## Key Features

### Core Hospital Management

- Secure login and registration with JWT authentication.
- Role-based access control for `ADMIN`, `DOCTOR`, `RECEPTIONIST`, and `PATIENT`.
- Doctor profile management, specialization lookup, availability, and consultation fee tracking.
- Patient registration, profile management, and medical history access.
- Appointment booking, schedule lookup, status updates, and cancellation.
- Medical record creation and updates for patient visits, notes, and prescriptions.
- Billing and payment tracking for consultations, treatments, medication, and lab charges.
- Admin dashboard with hospital statistics and operational summaries.
- User management for administrators.

### AI and Healthcare Education

- AI medical assistant with chat sessions, message history, educational responses, and rehabilitation guidance.
- Groq API support as the primary AI provider with OpenAI fallback configuration.

## Tech Stack

### Backend

- Java 17
- Spring Boot 3.2.3
- Spring Security 6
- Spring Data JPA / Hibernate
- H2 in-memory database
- JWT with `jjwt`
- Spring WebSocket
- Spring WebFlux WebClient
- Spring AI OpenAI starter
- SpringDoc OpenAPI / Swagger UI
- MapStruct
- Lombok
- Maven Wrapper

### Frontend

- React 18
- Vite 8
- React Router DOM 7
- Axios
- React Hot Toast
- Recharts
- React Icons
- React Markdown with GFM
- STOMP and SockJS clients
- Custom CSS modules by feature

## Project Structure

```text
hospital-management-system/
|-- hms-backend/
|   |-- src/main/java/com/hms/
|   |   |-- ai/                 # AI assistant, chat, voice guidance
|   |   |-- config/             # Security, JWT, CORS, WebSocket, seed data
|   |   |-- controller/         # REST API controllers
|   |   |-- dto/                # Request/response DTOs
|   |   |-- exception/          # Global and domain exception handling
|   |   |-- model/              # JPA entities
|   |   |-- repository/         # Spring Data repositories
|   |   |-- service/            # Business logic
|   |   `-- util/               # Shared utilities
|   |-- src/main/resources/
|   |   `-- application.properties
|   |-- pom.xml
|   `-- mvnw.cmd
|
|-- hms-frontend/
|   |-- src/
|   |   |-- components/         # Layout, navigation, shared UI
|   |   |-- context/            # Auth and real-time providers
|   |   |-- features/
|   |   |   `-- ai-assistant/
|   |   |-- pages/              # Core HMS pages
|   |   |-- services/           # API client wrappers
|   |   |-- App.jsx
|   |   `-- main.jsx
|   |-- package.json
|   `-- vite.config.js
|
|-- .env.example
|-- AI_ARCHITECTURE_EXTENSION.md
|-- AI_MEDICAL_ASSISTANT_README.md
|-- POSTURE_TRACKING_README.md
|-- WEBAR_ANATOMY_README.md
`-- README.md
```

## Role-Based Access

The table below summarizes high-level page/module access. Some backend actions are more specific: for example, user management is admin-only, bill creation and payment collection are admin/receptionist-only, and medical record creation/update is doctor-only.

| Module | Admin | Doctor | Receptionist | Patient |
| --- | --- | --- | --- | --- |
| Dashboard | Yes | Yes | Yes | Yes |
| Doctors | Yes | Yes | Yes | Yes |
| Patients | Yes | Yes | Yes | Yes |
| Appointments | Yes | Yes | Yes | Yes |
| Medical Records | Yes | Yes | Yes | Limited |
| Bills | Yes | Limited | Yes | Limited |
| User Management | Yes | No | No | No |
| AI Assistant | Yes | Yes | No | Yes |

## Application Routes

| Route | Description |
| --- | --- |
| `/login` | Login page with demo credential support |
| `/register` | User registration |
| `/dashboard` | Main dashboard |
| `/doctors` | Doctor list and management |
| `/patients` | Patient list and management |
| `/appointments` | Appointment booking and tracking |
| `/medical-records` | Visit records and prescriptions |
| `/bills` | Bills and payment history |
| `/users` | Admin user management |
| `/ai-assistant` | AI medical assistant chat |

## Getting Started

### Prerequisites

- Java 17 or higher
- Node.js 18 or higher
- Maven 3.9 or the included Maven Wrapper

### Environment Setup

Copy `.env.example` to `.env` and update values as needed:

```bash
GROQ_API_KEY=your-groq-api-key
OPENAI_API_KEY=your-openai-api-key
SPRING_DATASOURCE_URL=jdbc:h2:mem:hms_db
SPRING_DATASOURCE_USERNAME=sa
SPRING_DATASOURCE_PASSWORD=
APP_JWT_SECRET=your-super-secret-jwt-key-min-512-bits
APP_JWT_EXPIRATION_MS=86400000
SERVER_PORT=8081
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:3000
```

The application can run without external AI keys, but AI assistant features require a Groq or OpenAI key to work fully.

### Run the Backend

```bash
cd hms-backend
mvnw.cmd spring-boot:run
```

On Linux or macOS:

```bash
cd hms-backend
./mvnw spring-boot:run
```

Backend base URL:

```text
http://localhost:8081/api
```

Swagger UI:

```text
http://localhost:8081/api/swagger-ui.html
```

H2 Console:

```text
http://localhost:8081/api/h2-console
```

### Run the Frontend

```bash
cd hms-frontend
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## Running Both Servers

Open two terminals from the project root.

Backend:

```bash
cd hms-backend
mvnw.cmd spring-boot:run
```

Frontend:

```bash
cd hms-frontend
npm install
npm run dev
```

Then open `http://localhost:5173` in the browser.

## Demo Credentials

Sample data is initialized automatically when the backend starts.

| Role | Username | Password |
| --- | --- | --- |
| Admin | `admin` | `admin123` |
| Receptionist | `receptionist` | `recep123` |
| Doctor | `dr.rajesh` | `doctor123` |
| Patient | `rahul` | `patient123` |

The login page includes demo credential cards that can fill the username and password quickly.

## API Overview

The backend uses `server.servlet.context-path=/api`, so core endpoints are served under `http://localhost:8081/api`.

### Authentication

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/change-password`
- `GET /api/auth/me`

### Users

- `GET /api/users`
- `GET /api/users/role/{role}`
- `GET /api/users/{id}`
- `PUT /api/users/{id}`
- `PATCH /api/users/{id}/toggle-status`
- `DELETE /api/users/{id}`

### Doctors

- `GET /api/doctors`
- `GET /api/doctors/{id}`
- `GET /api/doctors/user/{userId}`
- `GET /api/doctors/specialization/{specialization}`
- `GET /api/doctors/search?name={name}`
- `GET /api/doctors/specializations`
- `POST /api/doctors`
- `PUT /api/doctors/{id}`
- `PATCH /api/doctors/{id}/status?status={status}`

### Patients

- `GET /api/patients`
- `GET /api/patients/{id}`
- `GET /api/patients/user/{userId}`
- `GET /api/patients/search?name={name}`
- `POST /api/patients`
- `PUT /api/patients/{id}`
- `PATCH /api/patients/{id}/status?status={status}`

### Appointments

- `GET /api/appointments`
- `GET /api/appointments/{id}`
- `GET /api/appointments/patient/{patientId}`
- `GET /api/appointments/doctor/{doctorId}`
- `GET /api/appointments/doctor/{doctorId}/date/{date}`
- `GET /api/appointments/status/{status}`
- `POST /api/appointments`
- `PATCH /api/appointments/{id}/status`
- `DELETE /api/appointments/{id}`

### Medical Records

- `GET /api/medical-records/{id}`
- `GET /api/medical-records/appointment/{appointmentId}`
- `GET /api/medical-records/patient/{patientId}`
- `GET /api/medical-records/doctor/{doctorId}`
- `POST /api/medical-records`
- `PUT /api/medical-records/{id}`

### Bills

- `GET /api/bills`
- `GET /api/bills/{id}`
- `GET /api/bills/patient/{patientId}`
- `GET /api/bills/status/{status}`
- `POST /api/bills`
- `POST /api/bills/{id}/payments`

### Dashboard

- `GET /api/dashboard/admin`

### AI Assistant

- `POST /api/ai/chat/sessions`
- `POST /api/ai/chat/sessions/{sessionId}/messages`
- `GET /api/ai/chat/sessions/{sessionId}/history`
- `GET /api/ai/chat/sessions`
- `PATCH /api/ai/chat/sessions/{sessionId}/end`
- `DELETE /api/ai/chat/sessions/{sessionId}`
- `POST /api/ai/educational`
- `POST /api/ai/rehabilitation/guide`
- `GET /api/ai/rehabilitation/categories`

## Production Build

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
npm run preview
```

The production frontend files are generated in `hms-frontend/dist`.

## Configuration Notes

Backend configuration is in:

```text
hms-backend/src/main/resources/application.properties
```

Common settings include:

- Server port and `/api` context path.
- H2 database connection.
- JWT secret and expiration.
- CORS origins.
- Groq and OpenAI provider keys.
- AI assistant prompt, rate limits, and conversation history limits.

Frontend API configuration is in:

```text
hms-frontend/src/services/api.js
```

Default frontend API base URL:

```javascript
const API_BASE_URL = 'http://localhost:8081/api/';
```

## Supporting Documentation

- `AI_MEDICAL_ASSISTANT_README.md`

## License

This project is intended for educational and demonstration purposes.
