# CivicPulse — Smart City Grievance & Feedback Management Portal

A full-stack, AI-powered Smart City web portal designed to revolutionize how municipal authorities and citizens interact. Built with **Spring Boot** and **Angular**, this platform facilitates real-time grievance reporting, transparent issue tracking, civic feedback collection, and AI-driven insights to ensure rapid and effective urban management.

---

## 🌟 Introduction & Vision

In rapidly growing smart cities, managing urban infrastructure and addressing citizen complaints efficiently is a monumental challenge. CivicPulse bridges the gap between citizens and municipal authorities by providing a centralized, transparent, and intelligent platform. 

Whether it's a broken street light, a water leak, or poor sanitation, CivicPulse allows citizens to report issues seamlessly, tracks the resolution via strict Service Level Agreements (SLAs), and leverages Artificial Intelligence to automatically route complaints to the appropriate department officers.

---

## 🏗️ Architecture & Technology Stack

CivicPulse is built on a robust, scalable microservices-inspired architecture, divided into three primary layers: a responsive frontend, a high-performance backend API, and a dedicated AI microservice for Natural Language Processing.

### 1. Frontend Client (Citizen & Admin Portal)
- **Framework:** Angular 21
- **Styling:** Custom SCSS with a modern, glassmorphic UI and native Dark/Light theme switching.
- **State Management:** RxJS Observables and Signals for reactive UI updates.
- **Change Detection:** Zone.js with Event Coalescing for highly optimized rendering.
- **Forms & Validation:** Angular Reactive Forms ensuring secure and structured data entry.

### 2. Backend Core (Business Logic & API)
- **Framework:** Spring Boot 3.2.5 (Java 17)
- **Security:** Spring Security with stateless JWT (JSON Web Tokens) authentication.
- **Data Access:** Spring Data JPA / Hibernate ORM.
- **Database:** MySQL 8.0, structured for relational integrity across Users, Departments, and Grievances.
- **Notifications:** Spring Mail for automated SMTP email alerts to users and officers.

### 3. AI & Data Intelligence (Microservice)
- **Framework:** Python Flask
- **Translation:** Google Translate API integration for dynamic, on-the-fly multilingual support.
- **NLP Engine:** Custom Python scripts utilizing `TextBlob` and `NLTK` for intent recognition and sentiment analysis of citizen queries.
- **Data Visualization:** Chart.js for rendering Admin analytics and Geospatial Heatmaps.

---

## 🚀 Core Features & Modules Explained

### Module 1 — Secure Authentication & Role Management
Security is paramount in civic applications. CivicPulse utilizes JWT to ensure stateless, scalable security.
- **Three-Tier Architecture:** 
  - **Citizen:** Can report issues and track their own grievances.
  - **Admin:** Oversees the entire city's operations, manages users, and analyzes data.
  - **Department Officer:** Dedicated personnel who receive assigned tasks and update resolution statuses.
- **Route Protection:** Angular Route Guards (`AuthGuard`, `RoleGuard`) prevent unauthorized access to specific dashboard panels.

### Module 2 — Intelligent Grievance Submission (Citizen Panel)
Empowering citizens to report issues accurately.
- **Detailed Reporting:** Users can specify categories (e.g., Road, Water, Sanitation), precise locations, and text descriptions.
- **Evidence Upload:** Built-in multipart file upload allows citizens to attach photos of the issue.
- **Timeline Tracking:** A visual tracker that updates in real-time as the grievance moves from `PENDING` → `IN_PROGRESS` → `RESOLVED`.
- **Multilingual Support:** A seamlessly integrated Google Translate widget allows citizens to navigate and report issues in their native regional languages.

### Module 3 — Grievance Management & Auto-Assignment (Admin Panel)
The administrative powerhouse of the platform.
- **Algorithmic Auto-Assignment:** Incoming grievances are analyzed and automatically routed to the correct department officer based on category matching and current workload balancing.
- **SLA (Service Level Agreement) Management:** Admins can enforce resolution deadlines (e.g., 1, 3, 7, 14, or 30 days). If an officer fails to resolve an issue within the SLA, the system flags it automatically.
- **Priority Triage:** Issues can be manually or automatically flagged as Low, Medium, or High priority.

### Module 4 — Officer Resolution Dashboard
Designed for on-the-ground efficiency.
- **Task Queue:** Officers see a filtered view of only their assigned grievances.
- **Overdue Alerts:** Any task breaching its SLA deadline is highlighted with critical red warnings.
- **Resolution Logging:** Officers update statuses and provide mandatory resolution notes detailing the fix before closing a ticket.

### Module 5 — Feedback & Sentiment Analysis
Closing the feedback loop with the community.
- **5-Star Rating System:** Once an issue is resolved, citizens are prompted to rate the service.
- **Reopen Mechanism:** If the fix is unsatisfactory, citizens can reopen the ticket, triggering an immediate notification to the admin.
- **AI Sentiment Tracking:** The system analyzes written feedback to gauge public satisfaction trends over time.

### Module 6 — City-Wide Analytics & Heatmaps
Data-driven decision making for city planners.
- **Real-Time Dashboards:** Dynamic summary cards showing Total, Pending, In Progress, and Resolved metrics.
- **Visual Charts:** Doughnut and Bar charts breaking down the frequency of complaints by department.
- **Geospatial Heatmaps:** A visual map interface highlighting the density of grievances, allowing admins to identify critical infrastructure failure zones (e.g., a neighborhood with recurring pipe bursts).

### Module 7 — Multilingual AI Chatbot Assistant
A 24/7 digital concierge for citizens.
- **Contextual Understanding:** The chatbot can answer FAQs, guide users to the submission form, or fetch the status of an existing complaint.
- **Cross-Lingual Intent Parsing:** If a citizen asks a question in Spanish or Hindi, the Python microservice translates it, determines the intent, queries the database, and returns the answer in the citizen's chosen language.

---

## 🛠️ Setup & Installation Instructions

### Prerequisites
Before you begin, ensure you have the following installed:
- **Java Development Kit (JDK) 17** or higher
- **Node.js 18** or higher (with NPM)
- **Python 3.9** or higher (with pip)
- **MySQL Server 8.0+**
- **Angular CLI** (install via `npm install -g @angular/cli`)

### Step 1 — Database Initialization
Open your MySQL Workbench or command line and execute the following SQL to set up the schema and seed department data:
```sql
CREATE DATABASE civicpulse_db;

USE civicpulse_db;

INSERT INTO departments (name, category) VALUES
('Water Department', 'WATER'),
('Roads Department', 'ROAD'),
('Sanitation Department', 'SANITATION'),
('Electricity Department', 'ELECTRICITY'),
('Street Lights Department', 'STREET_LIGHT'),
('Other Department', 'OTHER');
```

### Step 2 — Backend Configuration (Spring Boot)
Navigate to `src/main/resources/application.properties` and configure your environment variables:
```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/civicpulse_db?useSSL=false&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=your_mysql_password
spring.jpa.hibernate.ddl-auto=update

# JWT Security
jwt.secret=your_highly_secure_secret_key_minimum_256_bits_long

# Email SMTP Settings (For automated notifications)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your_gmail@gmail.com
spring.mail.password=your_gmail_app_password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

### Step 3 — Run the Backend Server
From the root of the backend directory, run:
```bash
./mvnw spring-boot:run
```
*The Spring Boot backend will start on: `http://localhost:8081`*

### Step 4 — Run the AI Sentiment Service (Python)
This microservice handles the chatbot NLP and sentiment analysis.
```bash
cd frontend/sentiment-service
pip install -r requirements.txt
python app.py
```
*The Python microservice will run on: `http://localhost:5000`*

### Step 5 — Run the Frontend Application (Angular)
Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
npm install
npm start
```
*The Angular client will compile and serve on: `http://localhost:4200`*

---

## 📁 Repository Structure Overview

```text
civicpulse-smart-city/
├── pom.xml                               # Backend Maven Configuration
├── src/main/java/com/civicpulse/civicpulse_backend/
│   ├── controller/                       # REST API Endpoints mapping
│   ├── dto/                              # Data Transfer Objects
│   ├── model/                            # JPA Entities (Database Tables)
│   ├── repository/                       # Spring Data JPA Interfaces
│   ├── security/                         # JWT Filters, Utils, and WebSecurityConfig
│   └── service/                          # Core Business Logic (SLA, Auto-Assign, Emails)
├── src/main/resources/
│   └── application.properties            # Environment Configurations
└── frontend/
    ├── sentiment-service/                # Python AI Microservice Folder
    │   ├── app.py
    │   └── requirements.txt
    ├── angular.json                      # Angular Workspace Configuration
    ├── package.json                      # Node Dependencies
    └── src/app/
        ├── auth/                         # Login & Registration Components
        ├── dashboards/                   # Role-specific UI Views
        ├── grievance/                    # Submission Forms & Tracking UI
        ├── admin/                        # Admin Management & Heatmaps
        ├── officer/                      # Resolution Task Queues
        ├── shared/                       # Global UI (Chatbot, Sidebar, Topbar)
        ├── services/                     # Angular HTTP & State Services
        ├── guards/                       # Route Protection
        └── interceptors/                 # HTTP Token Injection
```

---

## 🔒 Security & Architecture Notes
- **Stateless Authentication:** The backend does not maintain session state. Every request must include an `Authorization: Bearer <token>` header.
- **Change Detection:** The Angular frontend is heavily optimized using `zone.js` and Event Coalescing, ensuring that real-time API responses and asynchronous AI microservice data immediately trigger UI updates without performance degradation.
- **File Storage:** Uploaded grievance images are stored locally in the `uploads/` directory on the server. In a production environment, this should be mapped to an AWS S3 bucket or equivalent cloud storage.

---

## 👨‍💻 Development Team

This project was conceptualized, designed, and developed by:

**Ankit Saini**  
**Charitha**  
**Namit Pareek**  

*Dedicated to building smarter, more responsive cities through technology.*
