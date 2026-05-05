import { useState, useMemo } from 'react';
import { FaSearch, FaFilter, FaTh, FaList } from 'react-icons/fa';
import { useData } from '../context/DataContext';
import CourseCard from '../components/CourseCard';
import './Courses.css';

const Courses = () => {
  const { getApprovedCourses } = useData();
  const courses = getApprovedCourses();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(courses.map(course => course.category))];
    return ['all', ...cats];
  }, [courses]);

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    let result = [...courses];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(course =>
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        course.instructorName.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(course => course.category === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'popular':
        result.sort((a, b) => (b.enrolledStudents?.length || 0) - (a.enrolledStudents?.length || 0));
        break;
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    return result;
  }, [courses, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="courses-page">
      <div className="courses-header">
        <div className="header-content">
          <h1>Explore Courses</h1>
          <p>Discover courses from expert instructors and start learning today</p>
        </div>
      </div>

      <div className="courses-container">
        <div className="filters-section">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <FaFilter className="filter-icon" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Popular</option>
              <option value="title">Title A-Z</option>
            </select>
          </div>

          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <FaTh />
            </button>
            <button
              className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <FaList />
            </button>
          </div>
        </div>

        <div className="results-info">
          <p>
            Showing <strong>{filteredCourses.length}</strong> courses
            {selectedCategory !== 'all' && ` in ${selectedCategory}`}
            {searchQuery && ` for "${searchQuery}"`}
          </p>
        </div>

        {filteredCourses.length > 0 ? (
          <div className={`courses-list ${viewMode}`}>
            {filteredCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="no-results">
            <div className="no-results-icon">📚</div>
            <h3>No courses found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
