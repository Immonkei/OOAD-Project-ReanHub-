# 🎓 ReanHub – Learning Management System (LMS)

**ReanHub** is a full-stack **Learning Management System (LMS)** built to support online learning and classroom management for **students, teachers, and administrators**.

The system focuses on **role-based access**, clean separation between frontend and backend, and real-world academic workflows such as assignments, quizzes, grading, and progress tracking.

---

## 🚀 Project Overview

ReanHub provides a centralized platform where:

* Students can enroll in classes, submit assignments, and track progress
* Teachers can manage courses, assessments, and grading
* Administrators can oversee users, content, and system operations

This project was developed as part of an **Object-Oriented Analysis and Design (OOAD)** course and follows **real-world system design principles**.

---

## 🛠️ Tech Stack

### Frontend

* **React** (TypeScript)
* **Tailwind CSS**
* **shadcn/ui**
* **React Router**
* **TanStack Query** (server-state management)
* **React Hook Form**
* **Lucide React** (icons)

### Backend

* **Node.js** + **Express.js**
* **MongoDB** with **Mongoose ODM**
* **JWT** authentication
* **bcrypt** for password hashing
* **CORS** for secure cross-origin access

---

## 🧱 System Architecture

```
Frontend (React + TypeScript)
        |
        | JWT
        v
Backend API (Node.js + Express)
        |
        v
MongoDB (Mongoose ODM)
```

---

## 📁 Project Structure

```
OOAD-PROJECT/
├── backend/
│   ├── controllers/    # Request handling logic
│   ├── models/         # MongoDB schemas
│   ├── routes/         # API routes
│   ├── middleware/     # Auth & role protection
│   ├── config/         # App & DB configuration
│   ├── utils/          # Helper utilities
│   └── server.js       # Backend entry point
│
└── student-hub/
    ├── src/
    │   ├── components/ # Reusable UI components
    │   ├── pages/      # Page-level components
    │   ├── context/    # Global state providers
    │   ├── hooks/      # Custom hooks
    │   ├── services/   # API service layer
    │   └── utils/      # Utility functions
    └── package.json
```

---

## 👥 User Roles & Features

### 👨‍🎓 Student

* Enroll in classes
* View assignments and quizzes
* Submit assignments
* Take quizzes
* Track academic progress
* View grades and feedback

### 👨‍🏫 Teacher

* Create and manage classes
* Create assignments and quizzes
* Grade student submissions
* Monitor class performance
* Manage student enrollment

### 👨‍💼 Admin

* Manage users (students & teachers)
* Manage classes and content
* Oversee assignments and quizzes
* View system-wide analytics
* Configure platform settings

---

## 🔐 Authentication & Authorization

* JWT-based authentication
* Role-Based Access Control (RBAC)
* Protected routes per user role
* Secure password hashing with bcrypt

---

## 🗃️ Database Models

* **User** – Students, Teachers, Admins
* **Class** – Course metadata
* **Assignment** – Homework & projects
* **Quiz** – Assessments
* **Submission** – Student submissions
* **Grade** – Evaluation results

---

## 📚 API Endpoints (Sample)

### Authentication

* `POST /api/auth/register`
* `POST /api/auth/login`

### Classes

* `GET /api/classes`
* `POST /api/classes`
* `GET /api/classes/:id`
* `PUT /api/classes/:id`
* `DELETE /api/classes/:id`

### Assignments

* `GET /api/assignments`
* `POST /api/assignments`
* `GET /api/assignments/:id`
* `PUT /api/assignments/:id`
* `DELETE /api/assignments/:id`

### Quizzes

* `GET /api/quizzes`
* `POST /api/quizzes`
* `GET /api/quizzes/:id`
* `POST /api/quizzes/:id/submit`

---

## 🚀 Getting Started

### Prerequisites

* Node.js v16+
* MongoDB v4.4+
* npm or yarn

---

### 🖥️ Backend Setup

```bash
cd backend
npm install
npm run dev
```

Backend runs at:

```
http://localhost:5000
```

#### Environment Variables (`backend/.env`)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/reanhub
JWT_SECRET=your-secret-key
NODE_ENV=development
```

---

### 🌐 Frontend Setup

```bash
cd student-hub
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:8080
```

---

## 🎨 UI/UX Highlights

* Fully responsive design
* Role-based dashboards
* Clean, modern interface
* Accessible components
* Optimized form handling

---

## 📈 What This Project Demonstrates

* Full-stack application architecture
* Role-based authorization (RBAC)
* RESTful API design
* Secure authentication with JWT
* Scalable frontend structure
* Real academic workflow modeling

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to your branch
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👥 Authors

* **Min Phanith** & Team
  OOAD Project – Royal University of Phnom Penh

---

## 🙏 Acknowledgments

* Object-Oriented Analysis and Design course
* Open-source community
* Instructor: **Mao Makara
