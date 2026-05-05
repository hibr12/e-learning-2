import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaUsers, FaBook, FaEye, FaCheck, FaClock, FaChartBar } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import './InstructorDashboard.css';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const { getInstructorCourses, deleteCourse } = useData();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  const courses = getInstructorCourses(user?.id);

  // Stats
  const totalCourses = courses.length;
  const approvedCourses = courses.filter(c => c.isApproved).length;
  const pendingCourses = courses.filter(c => !c.isApproved).length;
  const totalStudents = courses.reduce((acc, c) => acc + (c.enrolledStudents?.length || 0), 0);

  const handleDeleteClick = (course) => {
    setCourseToDelete(course);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (courseToDelete) {
      await deleteCourse(courseToDelete.id);
      setShowDeleteModal(false);
      setCourseToDelete(null);
    }
  };

  return (
    <div className="instructor-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="welcome-section">
            <h1>Instructor Dashboard</h1>
            <p>Manage your courses and track student progress</p>
          </div>
          <Link to="/instructor/create-course" className="btn btn-create">
            <FaPlus /> Create New Course
          </Link>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon courses">
              <FaBook />
            </div>
            <div className="stat-info">
              <span className="stat-value">{totalCourses}</span>
              <span className="stat-label">Total Courses</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon approved">
              <FaCheck />
            </div>
            <div className="stat-info">
              <span className="stat-value">{approvedCourses}</span>
              <span className="stat-label">Approved</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon pending">
              <FaClock />
            </div>
            <div className="stat-info">
              <span className="stat-value">{pendingCourses}</span>
              <span className="stat-label">Pending Approval</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon students">
              <FaUsers />
            </div>
            <div className="stat-info">
              <span className="stat-value">{totalStudents}</span>
              <span className="stat-label">Total Students</span>
            </div>
          </div>
        </div>

        {/* Courses List */}
        <section className="courses-section">
          <div className="section-header">
            <h2><FaBook /> My Courses</h2>
          </div>

          {courses.length > 0 ? (
            <div className="courses-table-wrapper">
              <table className="courses-table">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Category</th>
                    <th>Lessons</th>
                    <th>Students</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map(course => (
                    <tr key={course.id}>
                      <td>
                        <div className="course-cell">
                          <img 
                            src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100'} 
                            alt={course.title}
                            className="course-thumb"
                          />
                          <div>
                            <h4>{course.title}</h4>
                            <p>{course.description.substring(0, 50)}...</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="category-badge">{course.category}</span>
                      </td>
                      <td>{course.lessons?.length || 0}</td>
                      <td>{course.enrolledStudents?.length || 0}</td>
                      <td>
                        <span className={`status-badge ${course.isApproved ? 'approved' : 'pending'}`}>
                          {course.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <Link to={`/course/${course.id}`} className="action-btn view" title="View">
                            <FaEye />
                          </Link>
                          <Link to={`/instructor/edit-course/${course.id}`} className="action-btn edit" title="Edit">
                            <FaEdit />
                          </Link>
                          <button 
                            className="action-btn delete" 
                            title="Delete"
                            onClick={() => handleDeleteClick(course)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h3>No courses yet</h3>
              <p>Create your first course and start sharing your knowledge</p>
              <Link to="/instructor/create-course" className="btn btn-primary">
                <FaPlus /> Create Course
              </Link>
            </div>
          )}
        </section>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Delete Course</h3>
            <p>Are you sure you want to delete "{courseToDelete?.title}"? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-cancel" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn btn-delete" onClick={handleDeleteConfirm}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorDashboard;
