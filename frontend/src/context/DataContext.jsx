import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiRequest } from '../services/api';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const { user, setUser, refreshUser } = useAuth();
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCourses = useCallback(async () => {
    const data = await apiRequest('/courses');
    setCourses(data.courses || []);
    return data.courses || [];
  }, []);

  const loadUsers = useCallback(async () => {
    if (user?.role !== 'admin') {
      setUsers([]);
      return [];
    }

    const data = await apiRequest('/admin/users');
    const nextUsers = (data.users || []).filter((item) => item.role !== 'admin');
    setUsers(nextUsers);
    return nextUsers;
  }, [user?.role]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      await loadCourses();
      await loadUsers();
    } finally {
      setLoading(false);
    }
  }, [loadCourses, loadUsers]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const replaceCourse = (course) => {
    setCourses((current) => {
      const exists = current.some((item) => item.id === course.id);
      return exists ? current.map((item) => (item.id === course.id ? course : item)) : [course, ...current];
    });
  };

  const createCourse = async (courseData) => {
    const data = await apiRequest('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData)
    });
    replaceCourse(data.course);
    return data.course;
  };

  const updateCourse = async (courseId, updates) => {
    const data = await apiRequest(`/courses/${courseId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
    replaceCourse(data.course);
    return data.course;
  };

  const deleteCourse = async (courseId) => {
    await apiRequest(`/courses/${courseId}`, { method: 'DELETE' });
    setCourses((current) => current.filter((course) => course.id !== courseId));
  };

  const getCourse = (courseId) => courses.find((course) => course.id === courseId);
  const getApprovedCourses = () => courses.filter((course) => course.isApproved);
  const getInstructorCourses = (instructorId) => courses.filter((course) => course.instructorId === instructorId);
  const getPendingCourses = () => courses.filter((course) => !course.isApproved);

  const addLesson = async (courseId, lessonData) => {
    const data = await apiRequest(`/courses/${courseId}/lessons`, {
      method: 'POST',
      body: JSON.stringify(lessonData)
    });
    replaceCourse(data.course);
    return data.lesson;
  };

  const updateLesson = async (courseId, lessonId, updates) => {
    const data = await apiRequest(`/courses/${courseId}/lessons/${lessonId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
    replaceCourse(data.course);
    return data.lesson;
  };

  const deleteLesson = async (courseId, lessonId) => {
    const data = await apiRequest(`/courses/${courseId}/lessons/${lessonId}`, { method: 'DELETE' });
    replaceCourse(data.course);
  };

  const enrollInCourse = async (courseId) => {
    const data = await apiRequest(`/courses/${courseId}/enroll`, { method: 'POST' });
    replaceCourse(data.course);
    setUser(data.user);
    return true;
  };

  const isEnrolled = (courseId) => {
    if (!user || user.role !== 'student') return false;
    return user.enrolledCourses?.includes(courseId);
  };

  const getEnrolledCourses = () => {
    if (!user || user.role !== 'student') return [];
    return courses.filter((course) => user.enrolledCourses?.includes(course.id));
  };

  const markLessonComplete = async (courseId, lessonId) => {
    const data = await apiRequest(`/courses/${courseId}/progress/${lessonId}`, { method: 'POST' });
    setUser(data.user);
    return data.user;
  };

  const getCourseProgress = (courseId) => {
    if (!user) return { completedLessons: [], percentage: 0 };
    return user.progress?.[courseId] || { completedLessons: [], percentage: 0 };
  };

  const isLessonComplete = (courseId, lessonId) => {
    const progress = getCourseProgress(courseId);
    return progress.completedLessons.includes(lessonId);
  };

  const submitQuiz = async (courseId, lessonId, answers, score) => {
    await apiRequest(`/courses/${courseId}/quiz/${lessonId}`, {
      method: 'POST',
      body: JSON.stringify({ answers, score })
    });
    return markLessonComplete(courseId, lessonId);
  };

  const getQuizResult = (courseId, lessonId) => {
    if (!user) return null;
    return user.completedQuizzes?.[`${courseId}-${lessonId}`];
  };

  const generateCertificate = async (courseId) => {
    const data = await apiRequest(`/courses/${courseId}/certificate`, { method: 'POST' });
    setUser(data.user);
    return data.certificate;
  };

  const getCertificate = (courseId) => {
    if (!user) return null;
    return user.certificates?.find((certificate) => certificate.courseId === courseId);
  };

  const updateAdminUser = async (userId, updates) => {
    const data = await apiRequest(`/admin/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
    setUsers((current) => current.map((item) => (item.id === userId ? data.user : item)));
    if (user?.id === userId) {
      await refreshUser();
    }
    return data.user;
  };

  const approveUser = (userId) => updateAdminUser(userId, { isApproved: true });
  const blockUser = (userId) => updateAdminUser(userId, { isBlocked: true });
  const unblockUser = (userId) => updateAdminUser(userId, { isBlocked: false });

  const approveCourse = async (courseId) => {
    const data = await apiRequest(`/admin/courses/${courseId}`, {
      method: 'PATCH',
      body: JSON.stringify({ isApproved: true })
    });
    replaceCourse(data.course);
    return data.course;
  };

  const rejectCourse = (courseId) => deleteCourse(courseId);
  const getPendingInstructors = () => users.filter((item) => item.role === 'instructor' && !item.isApproved);
  const getAllUsers = () => users;

  const getStats = () => ({
    totalCourses: courses.length,
    approvedCourses: courses.filter((course) => course.isApproved).length,
    pendingCourses: courses.filter((course) => !course.isApproved).length,
    totalStudents: users.filter((item) => item.role === 'student').length,
    totalInstructors: users.filter((item) => item.role === 'instructor').length,
    pendingInstructors: users.filter((item) => item.role === 'instructor' && !item.isApproved).length,
    totalEnrollments: courses.reduce((acc, course) => acc + (course.enrolledStudents?.length || 0), 0)
  });

  const value = {
    courses,
    users,
    loading,
    refreshData: loadData,
    createCourse,
    updateCourse,
    deleteCourse,
    getCourse,
    getApprovedCourses,
    getInstructorCourses,
    getPendingCourses,
    addLesson,
    updateLesson,
    deleteLesson,
    enrollInCourse,
    isEnrolled,
    getEnrolledCourses,
    markLessonComplete,
    getCourseProgress,
    isLessonComplete,
    submitQuiz,
    getQuizResult,
    generateCertificate,
    getCertificate,
    approveUser,
    blockUser,
    unblockUser,
    approveCourse,
    rejectCourse,
    getPendingInstructors,
    getAllUsers,
    getStats
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
