import { Link } from 'react-router-dom';
import { FaBookOpen, FaAward, FaChartLine, FaPlay, FaClock } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import CourseCard from '../../components/CourseCard';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { getEnrolledCourses, getApprovedCourses, getCourseProgress } = useData();

  const enrolledCourses = getEnrolledCourses();
  const allCourses = getApprovedCourses();
  const certificates = user?.certificates || [];

  // Calculate stats
  const totalEnrolled = enrolledCourses.length;
  const completedCourses = enrolledCourses.filter(course => {
    const progress = getCourseProgress(course.id);
    return progress.percentage === 100;
  }).length;
  const inProgressCourses = totalEnrolled - completedCourses;

  // Get courses in progress (not completed)
  const coursesInProgress = enrolledCourses.filter(course => {
    const progress = getCourseProgress(course.id);
    return progress.percentage > 0 && progress.percentage < 100;
  });

  // Recommended courses (not enrolled)
  const recommendedCourses = allCourses
    .filter(course => !user?.enrolledCourses?.includes(course.id))
    .slice(0, 3);

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back, {user?.name}! 👋</h1>
          <p>Continue your learning journey</p>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon enrolled">
              <FaBookOpen />
            </div>
            <div className="stat-info">
              <span className="stat-value">{totalEnrolled}</span>
              <span className="stat-label">Enrolled Courses</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon progress">
              <FaChartLine />
            </div>
            <div className="stat-info">
              <span className="stat-value">{inProgressCourses}</span>
              <span className="stat-label">In Progress</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon completed">
              <FaPlay />
            </div>
            <div className="stat-info">
              <span className="stat-value">{completedCourses}</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon certificates">
              <FaAward />
            </div>
            <div className="stat-info">
              <span className="stat-value">{certificates.length}</span>
              <span className="stat-label">Certificates</span>
            </div>
          </div>
        </div>

        {/* Continue Learning */}
        {coursesInProgress.length > 0 && (
          <section className="dashboard-section">
            <div className="section-header">
              <h2><FaClock /> Continue Learning</h2>
              <Link to="/courses" className="view-all">View All</Link>
            </div>
            <div className="courses-grid">
              {coursesInProgress.slice(0, 3).map(course => (
                <CourseCard key={course.id} course={course} showEnrollButton={false} />
              ))}
            </div>
          </section>
        )}

        {/* My Courses */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2><FaBookOpen /> My Courses</h2>
            {enrolledCourses.length > 3 && (
              <Link to="/courses" className="view-all">View All</Link>
            )}
          </div>
          {enrolledCourses.length > 0 ? (
            <div className="courses-grid">
              {enrolledCourses.slice(0, 3).map(course => (
                <CourseCard key={course.id} course={course} showEnrollButton={false} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h3>No courses yet</h3>
              <p>Start your learning journey by enrolling in a course</p>
              <Link to="/courses" className="btn btn-primary">Browse Courses</Link>
            </div>
          )}
        </section>

        {/* Certificates */}
        {certificates.length > 0 && (
          <section className="dashboard-section">
            <div className="section-header">
              <h2><FaAward /> My Certificates</h2>
            </div>
            <div className="certificates-grid">
              {certificates.map(cert => (
                <Link key={cert.id} to={`/certificate/${cert.id}`} className="certificate-card">
                  <div className="certificate-icon">
                    <FaAward />
                  </div>
                  <div className="certificate-info">
                    <h4>{cert.courseName}</h4>
                    <p>Completed on {new Date(cert.completedAt).toLocaleDateString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Recommended Courses */}
        {recommendedCourses.length > 0 && (
          <section className="dashboard-section">
            <div className="section-header">
              <h2>✨ Recommended for You</h2>
              <Link to="/courses" className="view-all">View All</Link>
            </div>
            <div className="courses-grid">
              {recommendedCourses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
