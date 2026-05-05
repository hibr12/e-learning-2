import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaGraduationCap, FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserGraduate, FaChalkboardTeacher } from 'react-icons/fa';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      };
      const newUser = await register(userData);

      if (newUser.role === 'instructor') {
        setSuccess('Registration successful! Please wait for admin approval before logging in.');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-left">
          <div className="auth-brand">
            <FaGraduationCap className="brand-icon" />
            <h1>EduLearn</h1>
          </div>
          <h2>Start Your Journey</h2>
          <p>Join thousands of learners and instructors on the best online learning platform.</p>
          
          <div className="features-list">
            <div className="feature-item">
              <span className="feature-icon">📚</span>
              <span>Access thousands of courses</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎓</span>
              <span>Earn certificates</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">👨‍🏫</span>
              <span>Learn from experts</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span>Track your progress</span>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-form-container">
            <h2>Create Account</h2>
            <p>Choose your role and fill in your details</p>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="role-selector">
              <button
                type="button"
                className={`role-btn ${formData.role === 'student' ? 'active' : ''}`}
                onClick={() => handleRoleSelect('student')}
              >
                <FaUserGraduate />
                <span>Student</span>
              </button>
              <button
                type="button"
                className={`role-btn ${formData.role === 'instructor' ? 'active' : ''}`}
                onClick={() => handleRoleSelect('instructor')}
              >
                <FaChalkboardTeacher />
                <span>Instructor</span>
              </button>
            </div>

            {formData.role === 'instructor' && (
              <div className="role-notice">
                <p>⚠️ Instructor accounts require admin approval before you can log in.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <div className="input-wrapper">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <div className="input-wrapper">
                    <FaLock className="input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <div className="input-wrapper">
                    <FaLock className="input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm password"
                      required
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-submit" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="auth-switch">
              Already have an account? <Link to="/login">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
