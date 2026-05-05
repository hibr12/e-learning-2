import { useState } from 'react';
import { FaUsers, FaBook, FaChartBar, FaUserGraduate, FaChalkboardTeacher, FaClock, FaCheck, FaBan, FaEye, FaUserCheck } from 'react-icons/fa';
import { useData } from '../../context/DataContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { 
    getStats, 
    getAllUsers, 
    getPendingCourses, 
    getPendingInstructors,
    approveUser,
    blockUser,
    unblockUser,
    approveCourse,
    rejectCourse,
    courses
  } = useData();

  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const stats = getStats();
  const allUsers = getAllUsers();
  const pendingCourses = getPendingCourses();
  const pendingInstructors = getPendingInstructors();

  const students = allUsers.filter(u => u.role === 'student');
  const instructors = allUsers.filter(u => u.role === 'instructor');

  const handleAction = (action, item) => {
    setModalAction(action);
    setSelectedItem(item);
    setShowModal(true);
  };

  const confirmAction = async () => {
    switch (modalAction) {
      case 'approveUser':
        await approveUser(selectedItem.id);
        break;
      case 'blockUser':
        await blockUser(selectedItem.id);
        break;
      case 'unblockUser':
        await unblockUser(selectedItem.id);
        break;
      case 'approveCourse':
        await approveCourse(selectedItem.id);
        break;
      case 'rejectCourse':
        await rejectCourse(selectedItem.id);
        break;
      default:
        break;
    }
    setShowModal(false);
    setModalAction(null);
    setSelectedItem(null);
  };

  const getActionMessage = () => {
    switch (modalAction) {
      case 'approveUser':
        return `Approve instructor "${selectedItem?.name}"?`;
      case 'blockUser':
        return `Block user "${selectedItem?.name}"? They will not be able to log in.`;
      case 'unblockUser':
        return `Unblock user "${selectedItem?.name}"?`;
      case 'approveCourse':
        return `Approve course "${selectedItem?.title}"? It will become visible to students.`;
      case 'rejectCourse':
        return `Reject course "${selectedItem?.title}"? This will delete the course.`;
      default:
        return '';
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Admin Dashboard</h1>
          <p>Manage users, courses, and platform settings</p>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total-courses">
              <FaBook />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.totalCourses}</span>
              <span className="stat-label">Total Courses</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon students">
              <FaUserGraduate />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.totalStudents}</span>
              <span className="stat-label">Students</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon instructors">
              <FaChalkboardTeacher />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.totalInstructors}</span>
              <span className="stat-label">Instructors</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon enrollments">
              <FaChartBar />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.totalEnrollments}</span>
              <span className="stat-label">Enrollments</span>
            </div>
          </div>
        </div>

        {/* Pending Items Alert */}
        {(pendingCourses.length > 0 || pendingInstructors.length > 0) && (
          <div className="pending-alerts">
            {pendingInstructors.length > 0 && (
              <div className="alert alert-warning" onClick={() => setActiveTab('instructors')}>
                <FaClock /> {pendingInstructors.length} instructor(s) awaiting approval
              </div>
            )}
            {pendingCourses.length > 0 && (
              <div className="alert alert-info" onClick={() => setActiveTab('courses')}>
                <FaClock /> {pendingCourses.length} course(s) awaiting approval
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <FaChartBar /> Overview
          </button>
          <button 
            className={`tab ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            <FaUserGraduate /> Students
          </button>
          <button 
            className={`tab ${activeTab === 'instructors' ? 'active' : ''}`}
            onClick={() => setActiveTab('instructors')}
          >
            <FaChalkboardTeacher /> Instructors
            {pendingInstructors.length > 0 && (
              <span className="badge">{pendingInstructors.length}</span>
            )}
          </button>
          <button 
            className={`tab ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            <FaBook /> Courses
            {pendingCourses.length > 0 && (
              <span className="badge">{pendingCourses.length}</span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-section">
              <div className="overview-grid">
                <div className="overview-card">
                  <h3>Platform Statistics</h3>
                  <div className="stat-list">
                    <div className="stat-row">
                      <span>Approved Courses</span>
                      <span className="value">{stats.approvedCourses}</span>
                    </div>
                    <div className="stat-row">
                      <span>Pending Courses</span>
                      <span className="value warning">{stats.pendingCourses}</span>
                    </div>
                    <div className="stat-row">
                      <span>Pending Instructors</span>
                      <span className="value warning">{stats.pendingInstructors}</span>
                    </div>
                    <div className="stat-row">
                      <span>Total Enrollments</span>
                      <span className="value">{stats.totalEnrollments}</span>
                    </div>
                  </div>
                </div>

                <div className="overview-card">
                  <h3>Recent Activity</h3>
                  <div className="activity-list">
                    <p className="empty-text">Activity tracking coming soon...</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div className="users-section">
              <h3>All Students ({students.length})</h3>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Enrolled Courses</th>
                      <th>Joined</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => (
                      <tr key={student.id}>
                        <td>{student.name}</td>
                        <td>{student.email}</td>
                        <td>{student.enrolledCourses?.length || 0}</td>
                        <td>{new Date(student.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span className={`status ${student.isBlocked ? 'blocked' : 'active'}`}>
                            {student.isBlocked ? 'Blocked' : 'Active'}
                          </span>
                        </td>
                        <td>
                          {student.isBlocked ? (
                            <button 
                              className="action-btn unblock"
                              onClick={() => handleAction('unblockUser', student)}
                            >
                              <FaUserCheck /> Unblock
                            </button>
                          ) : (
                            <button 
                              className="action-btn block"
                              onClick={() => handleAction('blockUser', student)}
                            >
                              <FaBan /> Block
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'instructors' && (
            <div className="users-section">
              <h3>All Instructors ({instructors.length})</h3>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Courses</th>
                      <th>Joined</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {instructors.map(instructor => (
                      <tr key={instructor.id} className={!instructor.isApproved ? 'pending-row' : ''}>
                        <td>{instructor.name}</td>
                        <td>{instructor.email}</td>
                        <td>{courses.filter(c => c.instructorId === instructor.id).length}</td>
                        <td>{new Date(instructor.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span className={`status ${instructor.isBlocked ? 'blocked' : !instructor.isApproved ? 'pending' : 'active'}`}>
                            {instructor.isBlocked ? 'Blocked' : !instructor.isApproved ? 'Pending' : 'Active'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {!instructor.isApproved && (
                              <button 
                                className="action-btn approve"
                                onClick={() => handleAction('approveUser', instructor)}
                              >
                                <FaCheck /> Approve
                              </button>
                            )}
                            {instructor.isBlocked ? (
                              <button 
                                className="action-btn unblock"
                                onClick={() => handleAction('unblockUser', instructor)}
                              >
                                <FaUserCheck /> Unblock
                              </button>
                            ) : (
                              <button 
                                className="action-btn block"
                                onClick={() => handleAction('blockUser', instructor)}
                              >
                                <FaBan /> Block
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="courses-section">
              <h3>All Courses ({courses.length})</h3>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Instructor</th>
                      <th>Category</th>
                      <th>Students</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map(course => (
                      <tr key={course.id} className={!course.isApproved ? 'pending-row' : ''}>
                        <td>
                          <div className="course-cell">
                            <img 
                              src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=60'} 
                              alt={course.title}
                            />
                            <span>{course.title}</span>
                          </div>
                        </td>
                        <td>{course.instructorName}</td>
                        <td>{course.category}</td>
                        <td>{course.enrolledStudents?.length || 0}</td>
                        <td>
                          <span className={`status ${course.isApproved ? 'active' : 'pending'}`}>
                            {course.isApproved ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <a 
                              href={`/course/${course.id}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="action-btn view"
                            >
                              <FaEye /> View
                            </a>
                            {!course.isApproved && (
                              <>
                                <button 
                                  className="action-btn approve"
                                  onClick={() => handleAction('approveCourse', course)}
                                >
                                  <FaCheck /> Approve
                                </button>
                                <button 
                                  className="action-btn reject"
                                  onClick={() => handleAction('rejectCourse', course)}
                                >
                                  <FaBan /> Reject
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Confirm Action</h3>
            <p>{getActionMessage()}</p>
            <div className="modal-actions">
              <button className="btn btn-cancel" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button 
                className={`btn ${modalAction?.includes('reject') || modalAction?.includes('block') ? 'btn-danger' : 'btn-confirm'}`}
                onClick={confirmAction}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
