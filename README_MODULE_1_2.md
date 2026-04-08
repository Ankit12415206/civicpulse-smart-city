# CivicPulse — Module 1 & Module 2

**Developer:** Ankit Saini

This repository contains the optimized versions of **Module 1** and **Module 2** as part of the Smart City group project.

## Module 1 — Authentication & Role Management
- **JWT Security:** Stateless authentication with secure token storage.
- **Role Control:** Enforced access for Citizen, Admin, and Officer roles.
- **UI Protection:** Route guards and HTTP interceptors for seamless UX.

## Module 2 — Grievance Submission (Citizen Panel)
- **Submit:** Detailed grievance reporting with category and description.
- **GPS:** Auto-location detection using browser Geolocation API.
- **Evidence:** Optional image upload support.
- **Tracking:** Real-time visual timeline (Pending → In Progress → Resolved).
- **History:** Enhanced "My Complaints" panel with status badges.

## Tech Stack
- **Backend:** Spring Boot 3.2.5, Spring Security, MySQL.
- **Frontend:** Angular 19, Reactive Forms, CSS Variables.

## Security Note
All sensitive configurations in `application.properties` have been masked with environment variable placeholders.
