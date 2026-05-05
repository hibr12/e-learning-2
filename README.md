# EduLearn - Online Learning Platform

A comprehensive web-based e-learning management system built with React (Vite). This platform supports three user roles: Students, Instructors, and Admins.

##  Features

###  Student Features

- Create account / Login with role selection
- Browse and search courses with filters
- Enroll in courses (one-click enrollment)
- Watch video lessons (YouTube embeds)
- Download PDF materials
- Take quizzes with auto-grading
- Track progress with visual progress bars
- Earn and download certificates

###  Instructor Features

- Create and manage courses
- Upload video lessons (YouTube embed URLs)
- Upload PDF resources
- Create quizzes with multiple choice questions
- Edit and delete lessons
- View enrolled students
- Track course performance

### 🛠 Admin Features

- Manage all users (students and instructors)
- Approve/reject instructor registrations
- Approve/reject courses before publishing
- Block/unblock users
- View platform statistics and reports

##  Course Structure

```
Course
 ┣ Title
 ┣ Description
 ┣ Category
 ┣ Thumbnail
 ┣ Lessons
 ┃   ┣ Video (YouTube embed)
 ┃   ┣ PDF (downloadable)
 ┃   ┗ Quiz (multiple choice)
 ┗ Certificate (auto-generated)
```

## 🛠 Technology Stack

- **Frontend Framework:** React 19 with Vite 7
- **Routing:** React Router DOM v7
- **Icons:** React Icons
- **Styling:** Custom CSS with modern design
- **State Management:** React Context API
- **Data Storage:** LocalStorage (can be replaced with Firebase/MongoDB)
- **Authentication:** Custom auth system (can be replaced with Firebase Auth/JWT)

##  Project Structure

```
src/
 ┣ components/
 ┃   ┣ Navbar.jsx
 ┃   ┣ ProtectedRoute.jsx
 ┃   ┗ CourseCard.jsx
 ┣ context/
 ┃   ┣ AuthContext.jsx
 ┃   ┗ DataContext.jsx
 ┣ pages/
 ┃   ┣ Home.jsx
 ┃   ┣ Login.jsx
 ┃   ┣ Register.jsx
 ┃   ┣ Courses.jsx
 ┃   ┣ CourseDetails.jsx
 ┃   ┣ Lesson.jsx
 ┃   ┣ Certificate.jsx
 ┃   ┣ student/
 ┃   ┃   ┗ StudentDashboard.jsx
 ┃   ┣ instructor/
 ┃   ┃   ┣ InstructorDashboard.jsx
 ┃   ┃   ┣ CreateCourse.jsx
 ┃   ┃   ┗ EditCourse.jsx
 ┃   ┗ admin/
 ┃       ┗ AdminDashboard.jsx
 ┣ App.jsx
 ┣ App.css
 ┣ main.jsx
 ┗ index.css
```

##  Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

##  Demo Accounts

The platform comes with pre-configured demo accounts:

| Role       | Email                | Password      |
| ---------- | -------------------- | ------------- |
| Admin      | admin@edulearn.com   | admin123      |
| Instructor | john@edulearn.com    | instructor123 |
| Student    | student@edulearn.com | student123    |

##  Pages Overview

### Public Pages

- **Home** (`/`) - Landing page with featured courses
- **Courses** (`/courses`) - Browse all approved courses
- **Course Details** (`/course/:id`) - View course information and lessons
- **Login** (`/login`) - User authentication
- **Register** (`/register`) - New user registration

### Student Pages

- **Dashboard** (`/student/dashboard`) - Overview of enrolled courses and progress
- **Lesson** (`/course/:id/lesson/:lessonId`) - Video/PDF viewer and quiz
- **Certificate** (`/certificate/:id`) - View and download certificate

### Instructor Pages

- **Dashboard** (`/instructor/dashboard`) - Manage courses and view stats
- **Create Course** (`/instructor/create-course`) - Create new course
- **Edit Course** (`/instructor/edit-course/:id`) - Edit existing course

### Admin Pages

- **Dashboard** (`/admin/dashboard`) - Platform management with tabs for:
  - Overview statistics
  - Student management
  - Instructor management (with approval system)
  - Course management (with approval system)

##  Functional Requirements

### Authentication

- ✅ Login / Register
- ✅ Role-based access control
- ✅ Protected routes
- ✅ Password encoding

### Course Management

- ✅ CRUD operations for courses
- ✅ Lesson management (video, PDF, quiz)
- ✅ Course approval workflow

### Enrollment System

- ✅ One-click enrollment
- ✅ Duplicate enrollment prevention
- ✅ Enrollment tracking

### Progress Tracking

- ✅ Mark lessons as complete
- ✅ Progress percentage calculation
- ✅ Visual progress bars

### Quiz System

- ✅ Multiple choice questions
- ✅ Auto-grading
- ✅ Score tracking
- ✅ Passing score requirement

### Certificate Generation

- ✅ Auto-generated upon course completion
- ✅ Student name and course name
- ✅ Completion date
- ✅ Certificate number
- ✅ Printable format

##  UI/UX Features

- ✅ Modern, clean design
- ✅ Responsive layout (mobile-friendly)
- ✅ Smooth animations and transitions
- ✅ Intuitive navigation
- ✅ Loading states
- ✅ Error handling
- ✅ Form validation

##  Security Features

- ✅ Protected routes based on user roles
- ✅ Password encoding (basic - use proper hashing in production)
- ✅ Input validation
- ✅ Session management

##  Future Enhancements

- [ ] Firebase/MongoDB integration
- [ ] Real-time notifications
- [ ] Discussion forums
- [ ] Instructor ratings and reviews
- [ ] Payment integration
- [ ] Video upload functionality
- [ ] Dark mode support
- [ ] Multi-language support

##  Learning Outcomes

This project demonstrates:

- Component-based architecture
- Authentication systems
- State management with Context API
- Client-side routing
- Form handling and validation
- Responsive design
- Role-based access control

##  License

This project is created for educational purposes.

---

Built with  using React and Vite
