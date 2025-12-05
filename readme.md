# ReanHub - Learning Management System

A comprehensive Learning Management System (LMS) built with modern web technologies for students, teachers, and administrators.

## 🚀 Project Overview

Student Hub is a full-stack web application designed to facilitate online learning and classroom management. The system provides different interfaces and functionalities for students, teachers, and administrators to manage courses, assignments, quizzes, and track academic progress.

## 🛠️ Tech Stack

### Frontend
- **React** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **React Router** for navigation
- **TanStack Query** for data fetching
- **React Hook Form** for form handling
- **Lucide React** for icons

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcrypt** for password hashing
- **CORS** for cross-origin requests

## 📁 Project Structure

OOAD-PROJECT/
├── backend/ # Backend server code
│ ├── controllers/ # Route controllers
│ ├── models/ # MongoDB models
│ ├── routes/ # API routes
│ ├── middleware/ # Custom middleware
│ ├── config/ # Database and app configuration
│ ├── utils/ # Utility functions
│ └── server.js # Entry point
└── student-hub/ # Frontend React application
├── src/
│ ├── components/ # Reusable UI components
│ ├── pages/ # Page components
│ ├── context/ # React context providers
│ ├── hooks/ # Custom React hooks
│ ├── services/ # API service functions
│ └── utils/ # Utility functions
└── package.json


## 👥 User Roles & Features

### 👨‍🎓 Student
- View and enroll in classes
- Access assignments and quizzes
- Submit assignments
- Take quizzes
- Track academic progress
- View grades and feedback

### 👨‍🏫 Teacher
- Create and manage classes
- Create assignments and quizzes
- Grade student submissions
- Track class performance
- Manage student enrollments

### 👨‍💼 Admin
- User management (students, teachers)
- Class management
- Assignment and Quiz management
- System-wide analytics
- Platform configuration

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Navigate to the project directory**
   ```bash
   cd OOAD-PROJECT

### Backend Setup
- cd backend
- npm install
Server will run on http://localhost:5000

###  Environment Configuration
- Create a .env file in the backend directory:
- PORT=5000
- MONGODB_URI=mongodb://localhost:27017/student-hub
- JWT_SECRET=your-jwt-secret-key
- NODE_ENV=development

###  Frontend Setup
- cd ../student-hub
- npm install
Server will run on http://localhost:8080

### 📚 API Endpoints

Authentication
- POST /api/auth/register - User registration
- POST /api/auth/login - User login

Classes
- GET /api/classes - Get all classes
- POST /api/classes - Create new class
- GET /api/classes/:id - Get class details
- DELETE /api/classes/:id - Delete class
- PUT /api/classes/:id - Update class

Assignments
- GET /api/assignments - Get assignments
- POST /api/assignments - Create assignment
- GET /api/assignments/:id - Get assignment details
- DELETE /api/assignments/:id - Delete assignment
- PUT /api/assignments/:id - Update assignment

Quizzes
- GET /api/quizzes - Get quizzes
- POST /api/quizzes - Create quiz
- GET /api/quizzes/:id - Get quiz details
- POST /api/quizzes/:id/submit - Submit quiz

### 🗃️ Database Models

- User - Students, Teachers, Admins
- Class - Course information
- Assignment - Homework and projects
- Quiz - Assessments and tests
- Submission - Student work submissions
- Grade - Evaluation results

### 🔐 Authentication & Authorization
 
- JWT-based authentication
- Role-based access control (RBAC)
- Protected routes for different user types
- Session management with secure tokens

### 🎨 UI/UX Features

- Responsive design for all devices
- Modern and clean interface
- Role-based dashboard redirection
- Accessible components


### 🚧 Development

You can run both frontend and backend from the root directory:
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd student-hub
npm run dev

### 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

### 📄 License

This project is licensed under the MIT License.

### 👥 Authors

- Min Phanith and team- OOAD Project.

### 🙏 Acknowledgments

- Object-Oriented Analysis and Design Course Requirements
- Open source community for amazing tools and libraries
- Instructor for guidelines (Mao Makara)


This README now correctly reflects your project structure with:
- **OOAD-PROJECT** as the root folder
- **backend** as the backend subfolder
- **student-hub** as the frontend subfolder

The instructions are updated to navigate between these directories properly for setup and running the application.






