import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetails from './pages/CourseDetails';
import Login from './pages/Login';
import Register from './pages/Register';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import Lesson from './pages/Lesson';
import Certificate from './pages/Certificate';

// Instructor Pages
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import CreateCourse from './pages/instructor/CreateCourse';
import EditCourse from './pages/instructor/EditCourse';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <div className="app">
            <Navbar />
            <main className="main-content">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/course/:courseId" element={<CourseDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Student Routes */}
                <Route
                  path="/student/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/course/:courseId/lesson/:lessonId"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <Lesson />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/certificate/:certificateId"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <Certificate />
                    </ProtectedRoute>
                  }
                />

                {/* Instructor Routes */}
                <Route
                  path="/instructor/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['instructor']}>
                      <InstructorDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/instructor/create-course"
                  element={
                    <ProtectedRoute allowedRoles={['instructor']}>
                      <CreateCourse />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/instructor/edit-course/:courseId"
                  element={
                    <ProtectedRoute allowedRoles={['instructor']}>
                      <EditCourse />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}

// 404 Component
function NotFound() {
  return (
    <div className="not-found">
      <h1>404</h1>
      <p>Page not found</p>
      <a href="/" className="btn-home">Go Home</a>
    </div>
  );
}

export default App;
