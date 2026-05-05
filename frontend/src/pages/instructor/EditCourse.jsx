import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaPlus, FaTrash, FaPlay, FaFilePdf, FaQuestionCircle, FaGripVertical } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import './CreateCourse.css';

const EditCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getCourse, updateCourse, addLesson, updateLesson, deleteLesson } = useData();

  const course = getCourse(courseId);

  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    category: '',
    thumbnail: ''
  });

  const [lessons, setLessons] = useState([]);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [currentLesson, setCurrentLesson] = useState({
    id: null,
    title: '',
    type: 'video',
    videoUrl: '',
    pdfUrl: '',
    duration: '',
    quiz: null
  });
  const [editingLessonIndex, setEditingLessonIndex] = useState(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (course) {
      if (course.instructorId !== user?.id) {
        navigate('/instructor/dashboard');
        return;
      }
      setCourseData({
        title: course.title,
        description: course.description,
        category: course.category,
        thumbnail: course.thumbnail || ''
      });
      setLessons(course.lessons || []);
    }
  }, [course, user, navigate]);

  const categories = [
    'Web Development',
    'Programming',
    'Data Science',
    'Design',
    'Marketing',
    'Business',
    'Other'
  ];

  if (!course) {
    return (
      <div className="create-course-page">
        <div className="page-header">
          <h1>Course Not Found</h1>
          <Link to="/instructor/dashboard" className="btn-back">
            <FaArrowLeft /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleCourseChange = (e) => {
    setCourseData({ ...courseData, [e.target.name]: e.target.value });
  };

  const handleLessonChange = (e) => {
    setCurrentLesson({ ...currentLesson, [e.target.name]: e.target.value });
  };

  const handleAddLesson = () => {
    setCurrentLesson({
      id: null,
      title: '',
      type: 'video',
      videoUrl: '',
      pdfUrl: '',
      duration: '',
      quiz: null
    });
    setEditingLessonIndex(null);
    setShowLessonModal(true);
  };

  const handleEditLesson = (index) => {
    setCurrentLesson(lessons[index]);
    setEditingLessonIndex(index);
    setShowLessonModal(true);
  };

  const handleDeleteLessonClick = async (index) => {
    const lesson = lessons[index];
    if (lesson.id) {
      await deleteLesson(courseId, lesson.id);
    }
    setLessons(lessons.filter((_, i) => i !== index));
  };

  const handleSaveLesson = async () => {
    if (!currentLesson.title) {
      alert('Please enter a lesson title');
      return;
    }

    if (editingLessonIndex !== null) {
      const lessonToUpdate = lessons[editingLessonIndex];
      if (lessonToUpdate.id) {
        await updateLesson(courseId, lessonToUpdate.id, currentLesson);
      }
      const updatedLessons = [...lessons];
      updatedLessons[editingLessonIndex] = { ...lessonToUpdate, ...currentLesson };
      setLessons(updatedLessons);
    } else {
      const newLesson = await addLesson(courseId, currentLesson);
      setLessons([...lessons, newLesson]);
    }
    setShowLessonModal(false);
  };

  const handleEditQuiz = (index) => {
    const lesson = lessons[index];
    setEditingLessonIndex(index);
    setQuizQuestions(lesson.quiz?.questions || []);
    setShowQuizModal(true);
  };

  const handleAddQuestion = () => {
    setQuizQuestions([
      ...quizQuestions,
      {
        id: `q-${Date.now()}`,
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0
      }
    ]);
  };

  const handleQuestionChange = (qIndex, field, value) => {
    const updated = [...quizQuestions];
    updated[qIndex][field] = value;
    setQuizQuestions(updated);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updated = [...quizQuestions];
    updated[qIndex].options[oIndex] = value;
    setQuizQuestions(updated);
  };

  const handleDeleteQuestion = (qIndex) => {
    setQuizQuestions(quizQuestions.filter((_, i) => i !== qIndex));
  };

  const handleSaveQuiz = async () => {
    const lesson = lessons[editingLessonIndex];
    const updatedQuiz = {
      questions: quizQuestions,
      passingScore: 70
    };
    
    if (lesson.id) {
      await updateLesson(courseId, lesson.id, { quiz: updatedQuiz });
    }
    
    const updatedLessons = [...lessons];
    updatedLessons[editingLessonIndex] = { ...lesson, quiz: updatedQuiz };
    setLessons(updatedLessons);
    setShowQuizModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!courseData.title || !courseData.description || !courseData.category) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      await updateCourse(courseId, courseData);
      navigate('/instructor/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  const getLessonIcon = (type) => {
    switch (type) {
      case 'video': return <FaPlay />;
      case 'pdf': return <FaFilePdf />;
      case 'quiz': return <FaQuestionCircle />;
      default: return <FaPlay />;
    }
  };

  return (
    <div className="create-course-page">
      <div className="page-header">
        <Link to="/instructor/dashboard" className="btn-back">
          <FaArrowLeft /> Back to Dashboard
        </Link>
        <h1>Edit Course</h1>
      </div>

      <div className="create-course-container">
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-section">
            <h2>Course Details</h2>
            
            <div className="form-group">
              <label htmlFor="title">Course Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={courseData.title}
                onChange={handleCourseChange}
                placeholder="Enter course title"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={courseData.description}
                onChange={handleCourseChange}
                placeholder="Describe what students will learn"
                rows="4"
                required
              ></textarea>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={courseData.category}
                  onChange={handleCourseChange}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="thumbnail">Thumbnail URL</label>
                <input
                  type="url"
                  id="thumbnail"
                  name="thumbnail"
                  value={courseData.thumbnail}
                  onChange={handleCourseChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <h2>Course Lessons</h2>
              <button type="button" className="btn btn-add-lesson" onClick={handleAddLesson}>
                <FaPlus /> Add Lesson
              </button>
            </div>

            {lessons.length > 0 ? (
              <div className="lessons-list">
                {lessons.map((lesson, index) => (
                  <div key={lesson.id || index} className="lesson-item">
                    <div className="lesson-drag">
                      <FaGripVertical />
                    </div>
                    <div className="lesson-icon">
                      {getLessonIcon(lesson.type)}
                    </div>
                    <div className="lesson-info">
                      <h4>{lesson.title}</h4>
                      <span className="lesson-type">{lesson.type}</span>
                      {lesson.type === 'quiz' && (
                        <span className="quiz-count">
                          {lesson.quiz?.questions?.length || 0} questions
                        </span>
                      )}
                    </div>
                    <div className="lesson-actions">
                      {lesson.type === 'quiz' && (
                        <button type="button" className="btn-edit" onClick={() => handleEditQuiz(index)}>
                          Edit Quiz
                        </button>
                      )}
                      <button type="button" className="btn-edit" onClick={() => handleEditLesson(index)}>
                        Edit
                      </button>
                      <button type="button" className="btn-remove" onClick={() => handleDeleteLessonClick(index)}>
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-lessons">
                <p>No lessons added yet. Click "Add Lesson" to get started.</p>
              </div>
            )}
          </div>

          <div className="form-actions">
            <Link to="/instructor/dashboard" className="btn btn-cancel">
              Cancel
            </Link>
            <button type="submit" className="btn btn-submit">
              <FaSave /> Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Lesson Modal */}
      {showLessonModal && (
        <div className="modal-overlay" onClick={() => setShowLessonModal(false)}>
          <div className="modal lesson-modal" onClick={e => e.stopPropagation()}>
            <h3>{editingLessonIndex !== null ? 'Edit Lesson' : 'Add New Lesson'}</h3>
            
            <div className="form-group">
              <label>Lesson Title *</label>
              <input
                type="text"
                name="title"
                value={currentLesson.title}
                onChange={handleLessonChange}
                placeholder="Enter lesson title"
              />
            </div>

            <div className="form-group">
              <label>Lesson Type</label>
              <div className="type-selector">
                {['video', 'pdf', 'quiz'].map(type => (
                  <button
                    key={type}
                    type="button"
                    className={`type-btn ${currentLesson.type === type ? 'active' : ''}`}
                    onClick={() => setCurrentLesson({ ...currentLesson, type })}
                  >
                    {getLessonIcon(type)}
                    <span>{type}</span>
                  </button>
                ))}
              </div>
            </div>

            {currentLesson.type === 'video' && (
              <>
                <div className="form-group">
                  <label>Video URL (YouTube Embed)</label>
                  <input
                    type="url"
                    name="videoUrl"
                    value={currentLesson.videoUrl}
                    onChange={handleLessonChange}
                    placeholder="https://www.youtube.com/embed/..."
                  />
                </div>
                <div className="form-group">
                  <label>Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={currentLesson.duration}
                    onChange={handleLessonChange}
                    placeholder="e.g., 15:30"
                  />
                </div>
              </>
            )}

            {currentLesson.type === 'pdf' && (
              <div className="form-group">
                <label>PDF URL</label>
                <input
                  type="url"
                  name="pdfUrl"
                  value={currentLesson.pdfUrl}
                  onChange={handleLessonChange}
                  placeholder="https://example.com/document.pdf"
                />
              </div>
            )}

            {currentLesson.type === 'quiz' && (
              <div className="quiz-notice">
                <p>Save this lesson first, then use "Edit Quiz" to add questions.</p>
              </div>
            )}

            <div className="modal-actions">
              <button type="button" className="btn btn-cancel" onClick={() => setShowLessonModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-save" onClick={handleSaveLesson}>
                {editingLessonIndex !== null ? 'Update' : 'Add'} Lesson
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {showQuizModal && (
        <div className="modal-overlay" onClick={() => setShowQuizModal(false)}>
          <div className="modal quiz-modal" onClick={e => e.stopPropagation()}>
            <h3>Edit Quiz Questions</h3>
            
            <div className="quiz-questions">
              {quizQuestions.map((q, qIndex) => (
                <div key={q.id} className="question-editor">
                  <div className="question-header">
                    <h4>Question {qIndex + 1}</h4>
                    <button type="button" className="btn-remove-sm" onClick={() => handleDeleteQuestion(qIndex)}>
                      <FaTrash />
                    </button>
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                      placeholder="Enter question"
                    />
                  </div>
                  <div className="options-editor">
                    {q.options.map((opt, oIndex) => (
                      <div key={oIndex} className="option-row">
                        <input
                          type="radio"
                          name={`correct-${qIndex}`}
                          checked={q.correctAnswer === oIndex}
                          onChange={() => handleQuestionChange(qIndex, 'correctAnswer', oIndex)}
                        />
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                          placeholder={`Option ${oIndex + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button type="button" className="btn btn-add-question" onClick={handleAddQuestion}>
              <FaPlus /> Add Question
            </button>

            <div className="modal-actions">
              <button type="button" className="btn btn-cancel" onClick={() => setShowQuizModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-save" onClick={handleSaveQuiz}>
                Save Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditCourse;
