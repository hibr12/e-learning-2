import { useParams, Link } from 'react-router-dom';
import { FaDownload, FaArrowLeft, FaAward, FaGraduationCap } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './Certificate.css';

const Certificate = () => {
  const { certificateId } = useParams();
  const { user } = useAuth();

  const certificate = user?.certificates?.find(c => c.id === certificateId);

  if (!certificate) {
    return (
      <div className="certificate-not-found">
        <h2>Certificate Not Found</h2>
        <p>The certificate you're looking for doesn't exist.</p>
        <Link to="/student/dashboard" className="btn btn-primary">Back to Dashboard</Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="certificate-page">
      <div className="certificate-actions no-print">
        <Link to="/student/dashboard" className="btn btn-back">
          <FaArrowLeft /> Back to Dashboard
        </Link>
        <button className="btn btn-download" onClick={handlePrint}>
          <FaDownload /> Download / Print
        </button>
      </div>

      <div className="certificate-wrapper">
        <div className="certificate">
          <div className="certificate-border">
            <div className="certificate-content">
              <div className="certificate-header">
                <div className="certificate-logo">
                  <FaGraduationCap />
                  <span>EduLearn</span>
                </div>
                <h1>Certificate of Completion</h1>
              </div>

              <div className="certificate-body">
                <p className="presented-to">This is to certify that</p>
                <h2 className="recipient-name">{certificate.studentName}</h2>
                <p className="has-completed">has successfully completed the course</p>
                <h3 className="course-name">{certificate.courseName}</h3>
                
                <div className="certificate-details">
                  <div className="detail-item">
                    <span className="label">Date of Completion</span>
                    <span className="value">
                      {new Date(certificate.completedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Certificate Number</span>
                    <span className="value">{certificate.certificateNumber}</span>
                  </div>
                </div>
              </div>

              <div className="certificate-footer">
                <div className="signature">
                  <div className="signature-line"></div>
                  <p className="signature-name">{certificate.instructorName}</p>
                  <p className="signature-title">Course Instructor</p>
                </div>
                <div className="certificate-seal">
                  <FaAward />
                </div>
                <div className="signature">
                  <div className="signature-line"></div>
                  <p className="signature-name">EduLearn</p>
                  <p className="signature-title">Learning Platform</p>
                </div>
              </div>

              <div className="certificate-watermark">
                <FaGraduationCap />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
