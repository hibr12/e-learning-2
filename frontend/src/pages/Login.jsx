import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaGraduationCap, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      
      // Redirect based on role
      const dashboardRoutes = {
        student: '/student/dashboard',
        instructor: '/instructor/dashboard',
        admin: '/admin/dashboard'
      };
      
      navigate(dashboardRoutes[user.role] || from);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Demo credentials
  const demoCredentials = [
    { role: 'Student', email: 'student@edulearn.com', password: 'student123' },
    { role: 'Instructor', email: 'john@edulearn.com', password: 'instructor123' },
    { role: 'Admin', email: 'admin@edulearn.com', password: 'admin123' }
  ];

  const fillDemoCredentials = (cred) => {
    setEmail(cred.email);
    setPassword(cred.password);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-left">
          <div className="auth-brand">
            <FaGraduationCap className="brand-icon" />
            <h1>EduLearn</h1>
          </div>
          <h2>Welcome Back!</h2>
          <p>Continue your learning journey with thousands of courses from expert instructors.</p>
          
          <div className="demo-credentials">
            <h4>Demo Credentials:</h4>
            {demoCredentials.map((cred, index) => (
              <button 
                key={index}
                className="demo-btn"
                onClick={() => fillDemoCredentials(cred)}
              >
                <span className="demo-role">{cred.role}</span>
                <span className="demo-email">{cred.email}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-form-container">
            <h2>Sign In</h2>
            <p>Enter your credentials to access your account</p>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <FaLock className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
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

              <button type="submit" className="btn btn-submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="auth-switch">
              Don't have an account? <Link to="/register">Sign Up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
