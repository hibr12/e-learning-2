import { Link } from 'react-router-dom';
import { FaPlay, FaBook, FaUsers, FaClock } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import './CourseCard.css';

const CourseCard = ({ course, showEnrollButton = true }) => {
  const { isStudent, isAuthenticated } = useAuth();
  const { isEnrolled, enrollInCourse, getCourseProgress } = useData();

  const enrolled = isEnrolled(course.id);
  const progress = getCourseProgress(course.id);

  const handleEnroll = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isStudent) {
      await enrollInCourse(course.id);
    }
  };

  const lessonCount = course.lessons?.length || 0;
  const videoCount = course.lessons?.filter(l => l.type === 'video').length || 0;

  return (
    <div className="course-card">
      <div className="course-thumbnail">
        <img 
          src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400'} 
          alt={course.title}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400';
          }}
        />
        <div className="course-category">{course.category}</div>
        {enrolled && (
          <div className="enrolled-badge">Enrolled</div>
        )}
      </div>

      <div className="course-content">
        <h3 className="course-title">{course.title}</h3>
        <p className="course-description">{course.description}</p>
        
        <div className="course-meta">
          <span className="meta-item">
            <FaPlay /> {videoCount} videos
          </span>
          <span className="meta-item">
            <FaBook /> {lessonCount} lessons
          </span>
          <span className="meta-item">
            <FaUsers /> {course.enrolledStudents?.length || 0} students
          </span>
        </div>

        <div className="course-instructor">
          <span>By {course.instructorName}</span>
        </div>

        {enrolled && progress.percentage > 0 && (
          <div className="progress-section">
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
            <span className="progress-text">{progress.percentage}% complete</span>
          </div>
        )}

        <div className="course-actions">
          {enrolled ? (
            <Link to={`/course/${course.id}`} className="btn btn-continue">
              Continue Learning
            </Link>
          ) : (
            <>
              <Link to={`/course/${course.id}`} className="btn btn-view">
                View Course
              </Link>
              {showEnrollButton && isAuthenticated && isStudent && (
                <button className="btn btn-enroll" onClick={handleEnroll}>
                  Enroll Now
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
