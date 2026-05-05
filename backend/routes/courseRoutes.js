import express from 'express';
import { randomUUID } from 'node:crypto';
import Course from '../models/Course.js';
import User from '../models/User.js';
import { optionalAuth, requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler, notFound } from '../utils/errors.js';

const router = express.Router();

const canEditCourse = (user, course) => {
  return user.role === 'admin' || (user.role === 'instructor' && course.instructorId === user.id);
};

router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const user = req.user;
  let query = { isApproved: true };

  if (user?.role === 'admin') {
    query = {};
  } else if (user?.role === 'instructor') {
    query = { $or: [{ isApproved: true }, { instructorId: user.id }] };
  }

  const courses = await Course.find(query).sort({ createdAt: -1 });
  res.json({ courses });
}));

router.post('/', requireAuth, requireRole('instructor', 'admin'), asyncHandler(async (req, res) => {
  const { title, description, category, thumbnail = '' } = req.body;

  const course = await Course.create({
    title,
    description,
    category,
    thumbnail,
    instructorId: req.user.id,
    instructorName: req.user.name,
    isApproved: req.user.role === 'admin',
    enrolledStudents: [],
    lessons: []
  });

  res.status(201).json({ course });
}));

router.patch('/:courseId', requireAuth, asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) return notFound(res, 'Course');
  if (!canEditCourse(req.user, course)) {
    return res.status(403).json({ message: 'You cannot edit this course' });
  }

  ['title', 'description', 'category', 'thumbnail', 'isApproved'].forEach((key) => {
    if (req.body[key] !== undefined) {
      course[key] = req.body[key];
    }
  });

  await course.save();
  res.json({ course });
}));

router.delete('/:courseId', requireAuth, asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) return notFound(res, 'Course');
  if (!canEditCourse(req.user, course)) {
    return res.status(403).json({ message: 'You cannot delete this course' });
  }

  await course.deleteOne();
  await User.updateMany({}, { $pull: { enrolledCourses: course.id } });
  res.json({ id: req.params.courseId });
}));

router.post('/:courseId/lessons', requireAuth, asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) return notFound(res, 'Course');
  if (!canEditCourse(req.user, course)) {
    return res.status(403).json({ message: 'You cannot edit this course' });
  }

  const lesson = {
    id: randomUUID(),
    title: req.body.title,
    type: req.body.type || 'video',
    videoUrl: req.body.videoUrl || '',
    pdfUrl: req.body.pdfUrl || '',
    duration: req.body.duration || '',
    quiz: req.body.quiz || { questions: [], passingScore: 70 },
    order: course.lessons.length + 1
  };

  course.lessons.push(lesson);
  await course.save();
  res.status(201).json({ course, lesson });
}));

router.patch('/:courseId/lessons/:lessonId', requireAuth, asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) return notFound(res, 'Course');
  if (!canEditCourse(req.user, course)) {
    return res.status(403).json({ message: 'You cannot edit this course' });
  }

  const lesson = course.lessons.find((item) => item.id === req.params.lessonId);
  if (!lesson) return notFound(res, 'Lesson');

  ['title', 'type', 'videoUrl', 'pdfUrl', 'duration', 'quiz'].forEach((key) => {
    if (req.body[key] !== undefined) {
      lesson[key] = req.body[key];
    }
  });

  await course.save();
  res.json({ course, lesson });
}));

router.delete('/:courseId/lessons/:lessonId', requireAuth, asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) return notFound(res, 'Course');
  if (!canEditCourse(req.user, course)) {
    return res.status(403).json({ message: 'You cannot edit this course' });
  }

  course.lessons = course.lessons
    .filter((lesson) => lesson.id !== req.params.lessonId)
    .map((lesson, index) => ({ ...lesson.toObject(), order: index + 1 }));

  await course.save();
  res.json({ course });
}));

router.post('/:courseId/enroll', requireAuth, requireRole('student'), asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course || !course.isApproved) return notFound(res, 'Course');

  if (!course.enrolledStudents.includes(req.user.id)) {
    course.enrolledStudents.push(req.user.id);
  }

  if (!req.user.enrolledCourses.includes(course.id)) {
    req.user.enrolledCourses.push(course.id);
  }

  req.user.progress = {
    ...req.user.progress,
    [course.id]: req.user.progress?.[course.id] || { completedLessons: [], percentage: 0 }
  };

  await Promise.all([course.save(), req.user.save()]);
  res.json({ course, user: req.user.toJSON() });
}));

router.post('/:courseId/progress/:lessonId', requireAuth, requireRole('student'), asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) return notFound(res, 'Course');

  const lessonExists = course.lessons.some((lesson) => lesson.id === req.params.lessonId);
  if (!lessonExists) return notFound(res, 'Lesson');

  const currentProgress = req.user.progress?.[course.id] || { completedLessons: [], percentage: 0 };
  const completedLessons = currentProgress.completedLessons.includes(req.params.lessonId)
    ? currentProgress.completedLessons
    : [...currentProgress.completedLessons, req.params.lessonId];

  req.user.progress = {
    ...req.user.progress,
    [course.id]: {
      completedLessons,
      percentage: course.lessons.length ? Math.round((completedLessons.length / course.lessons.length) * 100) : 0
    }
  };

  await req.user.save();
  res.json({ user: req.user.toJSON() });
}));

router.post('/:courseId/quiz/:lessonId', requireAuth, requireRole('student'), asyncHandler(async (req, res) => {
  req.user.completedQuizzes = {
    ...req.user.completedQuizzes,
    [`${req.params.courseId}-${req.params.lessonId}`]: {
      answers: req.body.answers || {},
      score: req.body.score || 0,
      completedAt: new Date().toISOString()
    }
  };

  await req.user.save();
  res.json({ user: req.user.toJSON() });
}));

router.post('/:courseId/certificate', requireAuth, requireRole('student'), asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) return notFound(res, 'Course');

  const progress = req.user.progress?.[course.id] || { percentage: 0 };
  if (progress.percentage < 100) {
    return res.status(400).json({ message: 'Complete all lessons before generating a certificate' });
  }

  const existingCertificate = req.user.certificates.find((cert) => cert.courseId === course.id);
  if (existingCertificate) {
    return res.json({ certificate: existingCertificate, user: req.user.toJSON() });
  }

  const certificate = {
    courseId: course.id,
    courseName: course.title,
    studentName: req.user.name,
    instructorName: course.instructorName,
    completedAt: new Date(),
    certificateNumber: `CERT-${Date.now()}`
  };

  req.user.certificates.push(certificate);
  await req.user.save();
  res.status(201).json({ certificate: req.user.certificates.at(-1), user: req.user.toJSON() });
}));

export default router;
