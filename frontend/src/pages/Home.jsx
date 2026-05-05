import { Link } from 'react-router-dom';
import { FaGraduationCap, FaPlayCircle, FaCertificate, FaUsers, FaChalkboardTeacher, FaStar, FaArrowRight } from 'react-icons/fa';
import { useData } from '../context/DataContext';
import CourseCard from '../components/CourseCard';
import './Home.css';

const Home = () => {
  const { getApprovedCourses, getStats } = useData();
  const courses = getApprovedCourses();
  const stats = getStats();
  const featuredCourses = courses.slice(0, 3);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>
              Unlock Your Potential with
              <span className="gradient-text"> World-Class Learning</span>
            </h1>
            <p>
              Join thousands of learners mastering new skills with expert-led courses. 
              Learn at your own pace, earn certificates, and advance your career.
            </p>
            <div className="hero-buttons">
              <Link to="/courses" className="btn btn-primary btn-lg">
                <FaPlayCircle /> Explore Courses
              </Link>
              <Link to="/register" className="btn btn-outline btn-lg">
                Get Started Free
              </Link>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">{stats.approvedCourses}+</span>
                <span className="stat-label">Courses</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.totalStudents}+</span>
                <span className="stat-label">Students</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.totalInstructors}+</span>
                <span className="stat-label">Instructors</span>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <div className="floating-card card-1">
              <FaGraduationCap />
              <span>Learn Anywhere</span>
            </div>
            <div className="floating-card card-2">
              <FaCertificate />
              <span>Get Certified</span>
            </div>
            <div className="floating-card card-3">
              <FaStar />
              <span>Top Quality</span>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600" 
              alt="Learning"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="section-container">
          <h2 className="section-title">Why Choose EduLearn?</h2>
          <p className="section-subtitle">
            We provide everything you need to succeed in your learning journey
          </p>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <FaPlayCircle />
              </div>
              <h3>Video Lessons</h3>
              <p>High-quality video content from expert instructors, available anytime.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FaChalkboardTeacher />
              </div>
              <h3>Expert Instructors</h3>
              <p>Learn from industry professionals with years of real-world experience.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FaCertificate />
              </div>
              <h3>Certificates</h3>
              <p>Earn recognized certificates upon completion to showcase your skills.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FaUsers />
              </div>
              <h3>Community</h3>
              <p>Join a community of learners and grow together.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="featured-courses">
        <div className="section-container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Featured Courses</h2>
              <p className="section-subtitle">
                Start learning with our most popular courses
              </p>
            </div>
            <Link to="/courses" className="view-all-link">
              View All Courses <FaArrowRight />
            </Link>
          </div>
          
          <div className="courses-grid">
            {featuredCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Start Learning?</h2>
          <p>Join EduLearn today and take the first step towards mastering new skills.</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-white btn-lg">
              Create Free Account
            </Link>
            <Link to="/courses" className="btn btn-outline-white btn-lg">
              Browse Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <FaGraduationCap className="footer-icon" />
            <span>EduLearn</span>
          </div>
          <p>© 2024 EduLearn. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
