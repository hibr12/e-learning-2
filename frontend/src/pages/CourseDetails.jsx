import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaPlay, FaFilePdf, FaQuestionCircle, FaCheckCircle, FaUsers, FaBook, FaClock, FaAward, FaLock } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import './CourseDetails.css';

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isStudent } = useAuth();
  const { getCourse, enrollInCourse, isEnrolled, getCourseProgress, isLessonComplete, getCertificate, generateCertificate } = useData();

  const course = getCourse(courseId);
  const enrolled = isEnrolled(courseId);
  const progress = getCourseProgress(courseId);
  const certificate = getCertificate(courseId);

  if (!course) {
    return (
      <div className="course-not-found">
        <h2>Course Not Found</h2>
        <p>The course you're looking for doesn't exist or has been removed.</p>
        <Link to="/courses" className="btn btn-primary">Browse Courses</Link>
      </div>
    );
  }

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/course/${courseId}` } });
      return;
    }
    if (isStudent) {
      await enrollInCourse(courseId);
    }
  };

  const handleGenerateCertificate = async () => {
    const cert = await generateCertificate(courseId);
    if (cert) {
      navigate(`/certificate/${cert.id}`);
    }
  };

  const getLessonIcon = (type) => {
    switch (type) {
      case 'video': return <FaPlay />;
      case 'pdf': return <FaFilePdf />;
      case 'quiz': return <FaQuestionCircle />;
      default: return <FaBook />;
    }
  };

  const videoCount = course.lessons?.filter(l => l.type === 'video').length || 0;
  const pdfCount = course.lessons?.filter(l => l.type === 'pdf').length || 0;
  const quizCount = course.lessons?.filter(l => l.type === 'quiz').length || 0;

  return (
    <div className="course-details-page">
      <div className="course-hero">
        <div className="course-hero-content">
          <div className="course-info">
            <span className="course-category">{course.category}</span>
            <h1>{course.title}</h1>
            <p className="course-description">{course.description}</p>
            
            <div className="course-meta">
              <span><FaUsers /> {course.enrolledStudents?.length || 0} students enrolled</span>
              <span><FaBook /> {course.lessons?.length || 0} lessons</span>
            </div>

            <div className="course-instructor-info">
              <div className="instructor-avatar">
                {course.instructorName.charAt(0)}
              </div>
              <div>
                <span className="instructor-label">Instructor</span>
                <span className="instructor-name">{course.instructorName}</span>
              </div>
            </div>

            {enrolled ? (
              <div className="enrollment-status">
                <div className="progress-section">
                  <div className="progress-header">
                    <span>Your Progress</span>
                    <span className="progress-percentage">{progress.percentage}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress.percentage}%` }}></div>
                  </div>
                </div>
                
                {progress.percentage === 100 && !certificate && (
                  <button className="btn btn-certificate" onClick={handleGenerateCertificate}>
                    <FaAward /> Generate Certificate
                  </button>
                )}
                
                {certificate && (
                  <Link to={`/certificate/${certificate.id}`} className="btn btn-certificate">
                    <FaAward /> View Certificate
                  </Link>
                )}
              </div>
            ) : (
              <button className="btn btn-enroll-large" onClick={handleEnroll}>
                {isAuthenticated ? 'Enroll Now - Free' : 'Login to Enroll'}
              </button>
            )}
          </div>

          <div className="course-thumbnail-large">
            <img 
              src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600'} 
              alt={course.title}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600';
              }}
            />
            <div className="course-stats-overlay">
              <div className="stat">
                <FaPlay />
                <span>{videoCount} Videos</span>
              </div>
              <div className="stat">
                <FaFilePdf />
                <span>{pdfCount} PDFs</span>
              </div>
              <div className="stat">
                <FaQuestionCircle />
                <span>{quizCount} Quizzes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="course-content-section">
        <div className="content-container">
          <h2>Course Content</h2>
          <p className="content-subtitle">
            {course.lessons?.length || 0} lessons • 
            {videoCount} videos • 
            {pdfCount} resources • 
            {quizCount} quizzes
          </p>

          <div className="lessons-list">
            {course.lessons?.map((lesson, index) => {
              const isComplete = isLessonComplete(courseId, lesson.id);
              const canAccess = enrolled;
              
              return (
                <div 
                  key={lesson.id} 
                  className={`lesson-item ${isComplete ? 'completed' : ''} ${!canAccess ? 'locked' : ''}`}
                >
                  <div className="lesson-number">
                    {isComplete ? <FaCheckCircle className="check-icon" /> : index + 1}
                  </div>
                  <div className="lesson-icon">
                    {getLessonIcon(lesson.type)}
                  </div>
                  <div className="lesson-info">
                    <h4>{lesson.title}</h4>
                    <span className="lesson-type">{lesson.type}</span>
                    {lesson.duration && <span className="lesson-duration"><FaClock /> {lesson.duration}</span>}
                  </div>
                  {canAccess ? (
                    <Link to={`/course/${courseId}/lesson/${lesson.id}`} className="lesson-action">
                      {isComplete ? 'Review' : 'Start'}
                    </Link>
                  ) : (
                    <span className="lesson-locked">
                      <FaLock /> Enroll to access
                    </span>
                  )}
                </div>
              );
            })}

            {(!course.lessons || course.lessons.length === 0) && (
              <div className="no-lessons">
                <p>No lessons available yet. Check back soon!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
