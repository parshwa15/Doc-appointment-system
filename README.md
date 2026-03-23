# Doctor Appointment System (MERN)

A full-stack role-based Doctor Appointment System built with React, Node.js, Express, and MongoDB Atlas.

## Tech Stack

- Frontend: React + Tailwind CSS + React Router DOM + Axios
- Backend: Node.js + Express + JWT + Multer + Cloudinary
- Database: MongoDB Atlas (Mongoose)

## Roles

- Software Admin: Manage hospitals
- Hospital Admin: Manage doctors, patients, appointments
- Doctor: Manage appointment decisions, prescriptions, timeslots
- Patient: Register/login, search doctors, book appointments, review doctors

## Project Structure

- backend: API server, models, controllers, routes, middleware, seed data
- frontend: React app with role dashboards and API services

## Setup

1. Copy `.env.example` to `.env` and fill values.
2. Install all dependencies:

```bash
npm install
npm run install:all
```

3. Seed sample data (optional):

```bash
npm run seed
```

4. Start both backend and frontend:

```bash
npm run dev
```

- Backend: http://localhost:5000
- Frontend: http://localhost:5174

## Sample Login Accounts

- Software Admin: software@admin.com / admin123
- Hospital Admin: HA001 / hospital@admin.com / hospital123
- Doctor: doctor@hospital.com / doctor123
- Patient: patient@example.com / patient123

## Core API Endpoints

### Software Admin

- POST `/api/software-admin/register`
- POST `/api/software-admin/login`
- GET `/api/software-admin/profile`
- PUT `/api/software-admin/profile`
- POST `/api/software-admin/create-hospital`
- GET `/api/software-admin/hospitals`
- PUT `/api/software-admin/update-hospital/:id`
- DELETE `/api/software-admin/delete-hospital/:id`
- POST `/api/software-admin/create-hospital-admin`
- GET `/api/software-admin/hospital-admins`
- PUT `/api/software-admin/update-hospital-admin/:id`
- DELETE `/api/software-admin/delete-hospital-admin/:id`

#### Create Hospital + Hospital Admin (Important)

When Software Admin creates a hospital, system now also creates a linked Hospital Admin account.

Request body for `POST /api/software-admin/create-hospital`:

```json
{
	"name": "Sunrise Hospital",
	"address": "MG Road, Bengaluru",
	"contactNo": "8888888888",
	"description": "Multi-speciality hospital",
	"adminName": "Hospital Manager",
	"adminEmail": "manager@sunrise.com",
	"adminPassword": "manager123",
	"adminContactNo": "7777777777"
}
```

Response includes Hospital Admin login credentials:

```json
{
	"message": "Hospital and hospital admin created",
	"hospital": { "_id": "..." },
	"hospitalAdminCredentials": {
		"adminId": "HA001",
		"email": "manager@sunrise.com",
		"password": "manager123"
	}
}
```

How to login as a particular Hospital Admin:

1. Create hospital from Software Admin dashboard with admin email/password.
2. Use returned `hospitalAdminCredentials.adminId`, `hospitalAdminCredentials.email` and `hospitalAdminCredentials.password`.
3. Login using `POST /api/hospital-admin/login` (or Hospital Admin Login page).

If `create-hospital` returns `400 Bad Request`:

- `Hospital admin email already registered`: use a different admin email.
- `Hospital name already exists`: use a different hospital name.

Software Admin dashboard now includes:

1. Profile section (update name, email, contact no, password)
2. Hospital Admin management section (create, update name/email/contact, delete multiple hospital admins)

### Hospital Admin

- POST `/api/hospital-admin/register`
- POST `/api/hospital-admin/login`
- GET `/api/hospital-admin/profile`
- PUT `/api/hospital-admin/profile`
- POST `/api/hospital-admin/create-doctor`
- POST `/api/hospital-admin/create-patient`
- GET `/api/hospital-admin/doctors`
- GET `/api/hospital-admin/patients`
- PUT `/api/hospital-admin/update-doctor/:id`
- DELETE `/api/hospital-admin/delete-doctor/:id`
- PUT `/api/hospital-admin/update-patient/:id`
- DELETE `/api/hospital-admin/delete-patient/:id`
- POST `/api/hospital-admin/book-appointment`
- GET `/api/hospital-admin/appointments`
- PUT `/api/hospital-admin/update-appointment-status/:id`

Hospital Admin login now requires all three fields:

```json
{
	"adminId": "HA001",
	"email": "hospital@admin.com",
	"password": "hospital123"
}
```

After successful login, Hospital Admin dashboard shows the logged-in admin's hospital name at the top.

Hospital Admin dashboard now includes:

1. Hospital Admin Profile section (update name, email, contact no)
2. Create Patient form now has an option to assign a specific doctor.

Hospital Admin password update is restricted and not allowed through profile or management update APIs.

### Doctor

- POST `/api/doctor/login`
- GET `/api/doctor/appointments`
- PUT `/api/doctor/update-status/:id`
- POST `/api/doctor/add-prescription`
- POST `/api/doctor/add-timeslot`

### Patient

- POST `/api/patient/register`
- POST `/api/patient/login`
- GET `/api/patient/doctors`
- POST `/api/patient/book-appointment`
- GET `/api/patient/appointments`
- POST `/api/patient/review`

## Notes

- Use `Authorization: Bearer <token>` for protected endpoints.
- Profile photo uploads are enabled through Cloudinary via multipart form-data.
- Frontend includes full software admin hospital CRUD and hospital admin doctor/patient CRUD flows.
