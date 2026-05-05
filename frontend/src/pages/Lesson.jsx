import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaDownload, FaPlay, FaFilePdf, FaQuestionCircle, FaList, FaTimes } from 'react-icons/fa';
import { useData } from '../context/DataContext';
import './Lesson.css';

const Lesson = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { getCourse, isEnrolled, markLessonComplete, isLessonComplete, submitQuiz, getQuizResult } = useData();

  const [showSidebar, setShowSidebar] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(null);

  const course = getCourse(courseId);
  const enrolled = isEnrolled(courseId);
  const lesson = course?.lessons?.find(l => l.id === lessonId);
  const lessonIndex = course?.lessons?.findIndex(l => l.id === lessonId) ?? -1;
  const prevLesson = lessonIndex > 0 ? course.lessons[lessonIndex - 1] : null;
  const nextLesson = course && lessonIndex >= 0 && lessonIndex < course.lessons.length - 1 ? course.lessons[lessonIndex + 1] : null;
  const completed = isLessonComplete(courseId, lessonId);
  const existingQuizResult = getQuizResult(courseId, lessonId);
  
  useEffect(() => {
    if (!course || !enrolled) {
      navigate(`/course/${courseId}`);
    }
  }, [course, enrolled, courseId, navigate]);

  useEffect(() => {
    if (existingQuizResult) {
      setQuizSubmitted(true);
      setQuizScore(existingQuizResult.score);
      setQuizAnswers(existingQuizResult.answers);
    } else {
      setQuizSubmitted(false);
      setQuizScore(null);
      setQuizAnswers({});
    }
  }, [lessonId, existingQuizResult]);

  if (!course) return null;

  if (!lesson) {
    return (
      <div className="lesson-not-found">
        <h2>Lesson Not Found</h2>
        <Link to={`/course/${courseId}`} className="btn btn-primary">Back to Course</Link>
      </div>
    );
  }

  const handleMarkComplete = async () => {
    await markLessonComplete(courseId, lessonId);
  };

  const handleQuizSubmit = async () => {
    const quiz = lesson.quiz;
    let correct = 0;
    
    quiz.questions.forEach(q => {
      if (quizAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });

    const score = Math.round((correct / quiz.questions.length) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);
    await submitQuiz(courseId, lessonId, quizAnswers, score);
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const getLessonIcon = (type) => {
    switch (type) {
      case 'video': return <FaPlay />;
      case 'pdf': return <FaFilePdf />;
      case 'quiz': return <FaQuestionCircle />;
      default: return <FaPlay />;
    }
  };

  const renderLessonContent = () => {
    switch (lesson.type) {
      case 'video':
        return (
          <div className="video-container">
            <iframe
              src={lesson.videoUrl}
              title={lesson.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        );

      case 'pdf':
        return (
          <div className="pdf-container">
            <div className="pdf-preview">
              <FaFilePdf className="pdf-icon" />
              <h3>{lesson.title}</h3>
              <p>Click the button below to download the PDF resource</p>
              <a 
                href={lesson.pdfUrl || '#'} 
                download 
                className="btn btn-download"
                onClick={(e) => {
                  if (!lesson.pdfUrl || lesson.pdfUrl === '#') {
                    e.preventDefault();
                    alert('PDF file is not available for this demo');
                  }
                }}
              >
                <FaDownload /> Download PDF
              </a>
            </div>
          </div>
        );

      case 'quiz':
        return (
          <div className="quiz-container">
            <div className="quiz-header">
              <h3>{lesson.title}</h3>
              <p>Answer all questions to complete this lesson. Passing score: {lesson.quiz?.passingScore || 70}%</p>
            </div>

            {quizSubmitted && (
              <div className={`quiz-result ${quizScore >= (lesson.quiz?.passingScore || 70) ? 'passed' : 'failed'}`}>
                <h4>
                  {quizScore >= (lesson.quiz?.passingScore || 70) ? '🎉 Congratulations!' : '😔 Try Again'}
                </h4>
                <p>Your score: <strong>{quizScore}%</strong></p>
                {quizScore >= (lesson.quiz?.passingScore || 70) ? (
                  <p>You passed the quiz!</p>
                ) : (
                  <p>You need {lesson.quiz?.passingScore || 70}% to pass.</p>
                )}
              </div>
            )}

            <div className="questions-list">
              {lesson.quiz?.questions.map((question, qIndex) => (
                <div key={question.id} className="question-item">
                  <h4>Question {qIndex + 1}</h4>
                  <p>{question.question}</p>
                  <div className="options-list">
                    {question.options.map((option, oIndex) => {
                      const isSelected = quizAnswers[question.id] === oIndex;
                      const isCorrect = question.correctAnswer === oIndex;
                      let optionClass = 'option-item';
                      
                      if (quizSubmitted) {
                        if (isCorrect) optionClass += ' correct';
                        else if (isSelected && !isCorrect) optionClass += ' incorrect';
                      } else if (isSelected) {
                        optionClass += ' selected';
                      }

                      return (
                        <button
                          key={oIndex}
                          className={optionClass}
                          onClick={() => handleAnswerSelect(question.id, oIndex)}
                          disabled={quizSubmitted}
                        >
                          <span className="option-letter">{String.fromCharCode(65 + oIndex)}</span>
                          <span className="option-text">{option}</span>
                          {quizSubmitted && isCorrect && <FaCheckCircle className="correct-icon" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {!quizSubmitted && (
              <button 
                className="btn btn-submit-quiz"
                onClick={handleQuizSubmit}
                disabled={Object.keys(quizAnswers).length !== lesson.quiz?.questions.length}
              >
                Submit Quiz
              </button>
            )}
          </div>
        );

      default:
        return <p>Unsupported lesson type</p>;
    }
  };

  return (
    <div className="lesson-page">
      <div className="lesson-header">
        <Link to={`/course/${courseId}`} className="back-link">
          <FaArrowLeft /> Back to Course
        </Link>
        <div className="lesson-title-header">
          <span className="lesson-type-badge">{lesson.type}</span>
          <h1>{lesson.title}</h1>
        </div>
        <button className="btn-sidebar-toggle" onClick={() => setShowSidebar(!showSidebar)}>
          <FaList />
        </button>
      </div>

      <div className="lesson-layout">
        <div className="lesson-main">
          <div className="lesson-content">
            {renderLessonContent()}
          </div>

          <div className="lesson-actions">
            {!completed && lesson.type !== 'quiz' && (
              <button className="btn btn-complete" onClick={handleMarkComplete}>
                <FaCheckCircle /> Mark as Complete
              </button>
            )}
            {completed && (
              <span className="completed-badge">
                <FaCheckCircle /> Completed
              </span>
            )}
          </div>

          <div className="lesson-navigation">
            {prevLesson ? (
              <Link to={`/course/${courseId}/lesson/${prevLesson.id}`} className="nav-btn prev">
                <FaArrowLeft />
                <div>
                  <span>Previous</span>
                  <strong>{prevLesson.title}</strong>
                </div>
              </Link>
            ) : (
              <div></div>
            )}
            {nextLesson ? (
              <Link to={`/course/${courseId}/lesson/${nextLesson.id}`} className="nav-btn next">
                <div>
                  <span>Next</span>
                  <strong>{nextLesson.title}</strong>
                </div>
                <FaArrowRight />
              </Link>
            ) : (
              <Link to={`/course/${courseId}`} className="nav-btn next">
                <div>
                  <span>Complete</span>
                  <strong>Back to Course</strong>
                </div>
                <FaArrowRight />
              </Link>
            )}
          </div>
        </div>

        <div className={`lesson-sidebar ${showSidebar ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h3>Course Content</h3>
            <button className="close-sidebar" onClick={() => setShowSidebar(false)}>
              <FaTimes />
            </button>
          </div>
          <div className="sidebar-lessons">
            {course.lessons?.map((l, index) => {
              const isActive = l.id === lessonId;
              const isComplete = isLessonComplete(courseId, l.id);
              
              return (
                <Link
                  key={l.id}
                  to={`/course/${courseId}/lesson/${l.id}`}
                  className={`sidebar-lesson ${isActive ? 'active' : ''} ${isComplete ? 'completed' : ''}`}
                  onClick={() => setShowSidebar(false)}
                >
                  <span className="lesson-number">
                    {isComplete ? <FaCheckCircle /> : index + 1}
                  </span>
                  <span className="lesson-icon">{getLessonIcon(l.type)}</span>
                  <span className="lesson-name">{l.title}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lesson;
