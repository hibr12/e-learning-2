import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaPlus, FaTrash, FaPlay, FaFilePdf, FaQuestionCircle, FaGripVertical } from 'react-icons/fa';
import { useData } from '../../context/DataContext';
import './CreateCourse.css';

const CreateCourse = () => {
  const navigate = useNavigate();
  const { createCourse, addLesson } = useData();

  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    category: '',
    thumbnail: ''
  });

  const [lessons, setLessons] = useState([]);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [currentLesson, setCurrentLesson] = useState({
    title: '',
    type: 'video',
    videoUrl: '',
    pdfUrl: '',
    duration: '',
    quiz: null
  });
  const [editingLessonIndex, setEditingLessonIndex] = useState(null);
  const [error, setError] = useState('');

  const categories = [
    'Web Development',
    'Programming',
    'Data Science',
    'Design',
    'Marketing',
    'Business',
    'Other'
  ];

  const handleCourseChange = (e) => {
    setCourseData({ ...courseData, [e.target.name]: e.target.value });
  };

  const handleLessonChange = (e) => {
    setCurrentLesson({ ...currentLesson, [e.target.name]: e.target.value });
  };

  const handleAddLesson = () => {
    setCurrentLesson({
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

  const handleDeleteLesson = (index) => {
    setLessons(lessons.filter((_, i) => i !== index));
  };

  const handleSaveLesson = () => {
    if (!currentLesson.title) {
      alert('Please enter a lesson title');
      return;
    }

    if (editingLessonIndex !== null) {
      const updatedLessons = [...lessons];
      updatedLessons[editingLessonIndex] = currentLesson;
      setLessons(updatedLessons);
    } else {
      setLessons([...lessons, currentLesson]);
    }
    setShowLessonModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!courseData.title || !courseData.description || !courseData.category) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      // Create course
      const newCourse = await createCourse(courseData);

      // Add lessons
      for (const lesson of lessons) {
        await addLesson(newCourse.id, lesson);
      }

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
        <h1>Create New Course</h1>
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
                  <div key={index} className="lesson-item">
                    <div className="lesson-drag">
                      <FaGripVertical />
                    </div>
                    <div className="lesson-icon">
                      {getLessonIcon(lesson.type)}
                    </div>
                    <div className="lesson-info">
                      <h4>{lesson.title}</h4>
                      <span className="lesson-type">{lesson.type}</span>
                    </div>
                    <div className="lesson-actions">
                      <button type="button" className="btn-edit" onClick={() => handleEditLesson(index)}>
                        Edit
                      </button>
                      <button type="button" className="btn-remove" onClick={() => handleDeleteLesson(index)}>
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
              <FaSave /> Create Course
            </button>
          </div>

          <div className="form-notice">
            <p>⚠️ Note: Your course will be submitted for admin approval before being published.</p>
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
                <p>Quiz questions can be added after creating the course by editing it.</p>
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
    </div>
  );
};

export default CreateCourse;
