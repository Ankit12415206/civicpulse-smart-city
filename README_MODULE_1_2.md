# CivicPulse — Module 1 & Module 2

**Developed by:** Ankit Saini

## Module 1 — Authentication & Role Management
- JWT-based login and registration
- Role-based access: Citizen, Admin, Officer
- Spring Security with stateless sessions
- Angular guards and interceptors

## Module 2 — Grievance Submission (Citizen Panel)
- Submit complaints with category, location, description
- Optional image upload
- GPS location detection
- Status tracking: Pending → In Progress → Resolved
- Visual timeline on complaint cards

## Tech Stack
- Backend: Spring Boot 3.2.5, Spring Security, JWT, MySQL
- Frontend: Angular 19, Reactive Forms

## How to Run
### Backend
cd backend
./mvnw spring-boot:run

### Frontend
cd frontend
npm install
ng serve
