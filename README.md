# CivicPulse — Smart City Grievance & Feedback Management Portal

A full-stack Smart City web portal built with Spring Boot and 
Angular 19 for real-time grievance reporting, issue tracking, 
and civic feedback collection.

---

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | Angular 19, Reactive Forms          |
| Backend  | Spring Boot 3.2.5, Spring Security  |
| Auth     | JWT (JSON Web Tokens)               |
| Database | MySQL 8.0 with JPA/Hibernate        |
| Charts   | Chart.js                            |
| Email    | Spring Mail (SMTP/Gmail)            |

---

## Modules

### Module 1 — Authentication & Role Management
- JWT-based login and registration
- Three roles: Citizen, Admin, Department Officer
- Role-based dashboard navigation
- Angular route guards and HTTP interceptors

### Module 2 — Grievance Submission (Citizen Panel)
- Submit complaints with category, location, description
- Optional image upload
- GPS location auto-detection
- Visual status timeline: Pending → In Progress → Resolved
- My Complaints page with status badges

### Module 3 — Grievance Management (Admin Panel)
- View all grievances in a table
- Assign grievances to department officers
- Set priority: Low / Medium / High
- Set SLA deadline: 1 / 3 / 7 / 14 / 30 days

### Module 4 — Officer Resolution Panel
- View grievances assigned to logged-in officer
- SLA deadline with overdue warnings in red
- Update status: In Progress / Resolved
- Add resolution notes

### Module 5 — Feedback & Rating System
- Star rating UI (1-5 stars) after grievance resolved
- Optional comment field
- Option to reopen if unsatisfied

### Module 6 — Analytics & Reports (Admin)
- Summary cards: Total, Pending, In Progress, Resolved
- Doughnut chart: complaints by status
- Bar chart: complaints by category

---

## API Endpoints

Base URL: `http://localhost:8080`

### Auth (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT token |

### Citizen (Requires CITIZEN role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/citizen/grievance/submit` | Submit new grievance |
| GET | `/api/citizen/grievance/my` | Get my grievances |
| POST | `/api/citizen/feedback/submit` | Submit star rating |
| PUT | `/api/citizen/feedback/reopen/{id}` | Reopen grievance |

### Admin (Requires ADMIN role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/grievance/all` | Get all grievances |
| PUT | `/api/admin/grievance/{id}/assign` | Assign officer + set deadline |
| GET | `/api/admin/officers` | Get all officers |
| GET | `/api/admin/departments` | Get all departments |
| GET | `/api/admin/analytics/summary` | Get status counts |
| GET | `/api/admin/analytics/categories` | Get category stats |

### Officer (Requires OFFICER role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/officer/assigned` | Get assigned grievances |
| PUT | `/api/officer/grievance/{id}/resolve` | Update status + add note |

### General (Requires any valid JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/grievance/{id}` | Get grievance by ID |
| PUT | `/api/grievance/{id}/status` | Update grievance status |

---

## Request & Response Examples

### Register
```json
POST /api/auth/register
{
  "username": "John Doe",
  "email": "john@test.com",
  "password": "pass123",
  "role": "CITIZEN"
}

Response:
{
  "message": "User registered successfully"
}
```

### Login
```json
POST /api/auth/login
{
  "email": "john@test.com",
  "password": "pass123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "role": "CITIZEN",
  "username": "John Doe"
}
```

### Submit Grievance
```
POST /api/citizen/grievance/submit
Authorization: Bearer <token>
Content-Type: multipart/form-data

Fields:
- title: "Broken street light"
- category: "STREET_LIGHT"
- location: "MG Road, Sector 5"
- description: "Light broken for 2 weeks"
- image: (optional file)
```

### Assign Officer (Admin)
```json
PUT /api/admin/grievance/1/assign
Authorization: Bearer <admin-token>
{
  "officerId": 2,
  "priority": 3,
  "deadlineDays": 3
}
```

### Resolve Grievance (Officer)
```json
PUT /api/officer/grievance/1/resolve
Authorization: Bearer <officer-token>
{
  "status": "RESOLVED",
  "note": "Street light replaced and tested"
}
```

### Submit Feedback (Citizen)
```json
POST /api/citizen/feedback/submit
Authorization: Bearer <citizen-token>
{
  "grievanceId": 1,
  "rating": 5,
  "comment": "Issue resolved quickly"
}
```

---

## Setup Instructions

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8.0+
- Angular CLI 19

### Step 1 — Database
Open MySQL Workbench and run:
```sql
CREATE DATABASE civicpulse_db;

INSERT INTO departments (name, category) VALUES
('Water Department', 'WATER'),
('Roads Department', 'ROAD'),
('Sanitation Department', 'SANITATION'),
('Electricity Department', 'ELECTRICITY'),
('Street Lights Department', 'STREET_LIGHT'),
('Other Department', 'OTHER');
```

### Step 2 — Backend Configuration
Open `backend/src/main/resources/application.properties` and fill in:
```properties
spring.datasource.password=your_mysql_password
jwt.secret=your_secret_key_minimum_256_bits
spring.mail.username=your_gmail@gmail.com
spring.mail.password=your_gmail_app_password
```

### Step 3 — Run Backend
```bash
cd backend
./mvnw spring-boot:run
```
Backend starts at: `http://localhost:8080`

### Step 4 — Run Frontend
```bash
cd frontend
npm install
ng serve
```
Frontend starts at: `http://localhost:4200`

---

## Project Structure
```
civicpulse-smart-city/
├── backend/
│   ├── pom.xml
│   └── src/main/java/com/civicpulse/civicpulse_backend/
│       ├── controller/
│       │   ├── AuthController.java
│       │   ├── GrievanceController.java
│       │   ├── AdminController.java
│       │   ├── OfficerController.java
│       │   ├── FeedbackController.java
│       │   └── AnalyticsController.java
│       ├── model/
│       │   ├── User.java + Role.java
│       │   ├── Grievance.java + GrievanceStatus.java
│       │   ├── Department.java
│       │   └── Feedback.java
│       ├── repository/
│       ├── security/
│       │   ├── JwtUtil.java
│       │   ├── JwtFilter.java
│       │   └── SecurityConfig.java
│       └── service/
└── frontend/
    └── src/app/
        ├── auth/login + register
        ├── dashboards/citizen + admin + officer
        ├── grievance/submit + my-complaints
        ├── admin/grievance-list + assign-officer
        ├── officer/assigned + resolve
        ├── feedback/
        ├── analytics/
        ├── services/
        ├── guards/
        └── interceptors/
```

---

## Notes
- All API endpoints except `/api/auth/**` require a valid JWT token
- Pass token in header: `Authorization: Bearer <your-token>`
- Roles are enforced server-side via Spring Security
- Images are stored in the `uploads/` folder on the server
