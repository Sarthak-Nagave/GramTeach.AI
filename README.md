GramTeach.AI

### Enterprise AI-Powered Multilingual Education Platform with Integrated IAM

---

## ▌Overview

GramTeach.AI is an enterprise-grade AI-powered educational platform capable of generating multilingual educational video content (English, Hindi, Marathi) while maintaining a secure and scalable Identity and Access Management (IAM) architecture.

The system integrates advanced AI-driven content generation with robust authentication, authorization, administrative governance, and audit logging mechanisms.

It is designed following enterprise software architecture principles with clear separation of concerns between AI services, authentication systems, and frontend experience.

---

## ▌Project Type

AI-Based Educational Video Generation Platform
with Built-in Enterprise Identity & Access Management (IAM)

---

## ▌Key Capabilities

### 1. Multilingual AI Video Generation Engine

* AI-powered educational content generation
* Automated script generation
* Multilingual support:

  * English
  * Hindi
  * Marathi
* Structured educational content formatting
* Role-restricted content generation access
* Audit logging of generation activity

### 2. Enterprise Identity & Access Management

* SuperAdmin and Admin role management
* Role-Based Access Control (RBAC)
* Secure JWT authentication (Access + Refresh Tokens)
* Protected backend APIs
* Protected frontend routes
* Admin CRUD operations
* Permission enforcement middleware

### 3. Monitoring & Governance

* Activity logs
* Login history tracking
* Audit trail system
* Dashboard analytics

---

## ▌Technology Stack

### Backend

* FastAPI
* PostgreSQL
* SQLAlchemy ORM
* JWT Authentication (Access + Refresh Tokens)
* Pydantic for validation

### Frontend

* React (Vite)
* Tailwind CSS / MUI / Custom CSS

### Security Layer

* Token-based authentication
* Role-based authorization middleware
* Backend-level permission enforcement
* Secure password hashing

---

## ▌System Architecture

```text
                        ┌──────────────────────────┐
                        │        Frontend UI       │
                        │      React + Vite        │
                        └────────────┬─────────────┘
                                     │
                                     │ HTTPS (JWT)
                                     ▼
                        ┌──────────────────────────┐
                        │        FastAPI API       │
                        ├──────────────────────────┤
                        │ Authentication Layer     │
                        │ RBAC Middleware          │
                        │ AI Video Engine Service  │
                        │ Admin Management         │
                        │ Audit Logging            │
                        └────────────┬─────────────┘
                                     │
                                     ▼
                        ┌──────────────────────────┐
                        │       PostgreSQL DB      │
                        │ Users | Roles | Logs     │
                        └──────────────────────────┘
```

---

## ▌AI Video Generation Workflow

```text
Admin User
     │
     ▼
AI Script Generator
     │
     ▼
Multilingual Translation Layer
     │
     ▼
Text-to-Speech Engine
     │
     ▼
Educational Video Output
```

The AI engine enables scalable automated educational content production while maintaining access control through RBAC enforcement.

---

## ▌Database Schema Overview

### Users

* id
* name
* email
* hashed_password
* role_id
* is_active
* created_at

### Roles

* id
* role_name (SuperAdmin / Admin)
* permissions

### Activity Logs

* id
* user_id
* action
* timestamp
* metadata

### Login History

* id
* user_id
* login_time
* ip_address
* device_info

---

## ▌API Endpoints Overview

| Method | Endpoint        | Description                | Access        |
| ------ | --------------- | -------------------------- | ------------- |
| POST   | /auth/login     | User authentication        | Public        |
| POST   | /auth/refresh   | Refresh access token       | Authenticated |
| POST   | /auth/logout    | Logout user                | Authenticated |
| GET    | /users          | List users                 | Admin         |
| POST   | /users          | Create user                | SuperAdmin    |
| PUT    | /users/{id}     | Update user                | Admin         |
| DELETE | /users/{id}     | Delete user                | SuperAdmin    |
| POST   | /generate-video | Generate educational video | Admin         |
| GET    | /logs           | View system logs           | Admin         |
| GET    | /dashboard      | Dashboard analytics        | Admin         |

---

## ▌Installation Guide

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/gramteach-ai.git
cd gramteach-ai
```

---

### 2. Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
```

Create `.env` file:

```
DATABASE_URL=postgresql://user:password@localhost:5432/gramteach
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

Run backend:

```bash
uvicorn main:app --reload
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

## ▌Security Best Practices Implemented

* Secure password hashing
* Access + Refresh token lifecycle management
* Role-based route protection
* Backend-level permission validation
* Activity audit logging
* Login history tracking
* Structured validation using Pydantic

---

## ▌Project Structure

```
gramteach-ai/
│
├── backend/
│   ├── models/
│   ├── routers/
│   ├── services/
│   ├── schemas/
│   ├── core/
│   └── main.py
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── services/
│
└── README.md
```

---

## ▌Future Enhancements

* Granular permission matrix
* Multi-factor authentication (MFA)
* OAuth2 / SSO integration
* Docker containerization
* CI/CD integration
* Cloud deployment (AWS / Azure / GCP)
* AI content personalization engine
* Automated subtitle generation

---

## ▌Author

Sarthak Nivrutti Nagave
B.Tech Computer Science (Artificial Intelligence)
Pune, India

GitHub: [https://github.com/yourusername]([https://github.com/yourusername](https://github.com/Sarthak-Nagave))

---

## ▌Conclusion

GramTeach.AI is an enterprise-ready AI-driven educational platform combining multilingual video generation with secure IAM architecture.

The system demonstrates strong capabilities in:

* Backend architecture design
* Secure authentication systems
* Role-based access control
* AI service integration
* Database modeling
* Full-stack system development

This project reflects production-level engineering practices suitable for enterprise environments and AI-driven education platforms.

