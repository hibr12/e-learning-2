import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaGraduationCap, FaUser, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import { useState } from 'react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated, isStudent, isInstructor, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={closeMobileMenu}>
          <FaGraduationCap className="brand-icon" />
          <span>EduLearn</span>
        </Link>

        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <div className="navbar-links">
            <Link to="/" className="nav-link" onClick={closeMobileMenu}>Home</Link>
            <Link to="/courses" className="nav-link" onClick={closeMobileMenu}>Courses</Link>
            
            {isAuthenticated && (
              <>
                {isStudent && (
                  <Link to="/student/dashboard" className="nav-link" onClick={closeMobileMenu}>
                    My Learning
                  </Link>
                )}
                {isInstructor && (
                  <Link to="/instructor/dashboard" className="nav-link" onClick={closeMobileMenu}>
                    Instructor Panel
                  </Link>
                )}
                {isAdmin && (
                  <Link to="/admin/dashboard" className="nav-link" onClick={closeMobileMenu}>
                    Admin Panel
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="navbar-auth">
            {isAuthenticated ? (
              <div className="user-menu">
                <div className="user-info">
                  <FaUser className="user-icon" />
                  <span className="user-name">{user.name}</span>
                  <span className="user-role">{user.role}</span>
                </div>
                <button className="btn btn-logout" onClick={handleLogout}>
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-outline" onClick={closeMobileMenu}>
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary" onClick={closeMobileMenu}>
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
