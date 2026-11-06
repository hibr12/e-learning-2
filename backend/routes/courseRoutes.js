import express from 'express';
import { randomUUID } from 'node:crypto';
import multer from 'multer';
import { prisma } from '../config/db.js';
import { optionalAuth, requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler, notFound } from '../utils/errors.js';
import { courseInclude, getUserDto, toCourseDto } from '../utils/serializers.js';
import { uploadsDir } from '../utils/uploadStorage.js';

const upload = multer({
  dest: uploadsDir,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype !== 'application/pdf') {
      const error = new Error('Only PDF files are allowed');
      error.status = 400;
      return callback(error);
    }
    callback(null, true);
  }
});
const router = express.Router();

const canEditCourse = (user, course) =>
  user.role === 'admin' || (user.role === 'instructor' && course.instructorId === user.id);
const courseDtoForUser = (course, user) => toCourseDto(course, {
  includeCorrectAnswers: user?.role === 'admin' || user?.id === course.instructorId
});

const findCourse = (id, tx = prisma) => tx.course.findUnique({
  where: { id },
  include: courseInclude
});

const parseQuiz = (quiz = {}) => {
  const parsed = typeof quiz === 'string' ? JSON.parse(quiz) : quiz;
  return {
    passingScore: Number(parsed.passingScore) || 70,
    questions: Array.isArray(parsed.questions) ? parsed.questions : []
  };
};

const quizQuestionData = (questions) => questions.map((question) => ({
  id: question.id || randomUUID(),
  question: question.question,
  options: Array.isArray(question.options) ? question.options : [],
  correctAnswer: Number.isInteger(question.correctAnswer) ? question.correctAnswer : 0
}));

router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  let where = { isApproved: true };
  if (req.user?.role === 'admin') {
    where = {};
  } else if (req.user?.role === 'instructor') {
    where = { OR: [{ isApproved: true }, { instructorId: req.user.id }] };
  }

  const courses = await prisma.course.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: courseInclude
  });
  res.json({ courses: courses.map((course) => courseDtoForUser(course, req.user)) });
}));

router.get('/:courseId', optionalAuth, asyncHandler(async (req, res) => {
  const course = await findCourse(req.params.courseId);
  if (!course) return notFound(res, 'Course');
  if (!course.isApproved && req.user?.role !== 'admin' &&
    !(req.user?.role === 'instructor' && req.user.id === course.instructorId)) {
    return notFound(res, 'Course');
  }
  res.json({ course: courseDtoForUser(course, req.user) });
}));

router.post('/', requireAuth, requireRole('instructor', 'admin'), asyncHandler(async (req, res) => {
  const { title, description, category, thumbnail = '' } = req.body;
  const course = await prisma.course.create({
    data: {
      title,
      description,
      category,
      thumbnail,
      instructorId: req.user.id,
      instructorName: req.user.name,
      isApproved: req.user.role === 'admin'
    },
    include: courseInclude
  });
  res.status(201).json({ course: courseDtoForUser(course, req.user) });
}));

router.patch('/:courseId', requireAuth, asyncHandler(async (req, res) => {
  const course = await findCourse(req.params.courseId);
  if (!course) return notFound(res, 'Course');
  if (!canEditCourse(req.user, course)) {
    return res.status(403).json({ message: 'You cannot edit this course' });
  }

  const data = {};
  for (const key of ['title', 'description', 'category', 'thumbnail']) {
    if (req.body[key] !== undefined) data[key] = req.body[key];
  }
  const updated = await prisma.course.update({
    where: { id: course.id },
    data,
    include: courseInclude
  });
  res.json({ course: courseDtoForUser(updated, req.user) });
}));

router.delete('/:courseId', requireAuth, asyncHandler(async (req, res) => {
  const course = await findCourse(req.params.courseId);
  if (!course) return notFound(res, 'Course');
  if (!canEditCourse(req.user, course)) {
    return res.status(403).json({ message: 'You cannot delete this course' });
  }

  await prisma.course.delete({ where: { id: course.id } });
  res.json({ id: req.params.courseId });
}));

router.post('/:courseId/lessons', requireAuth, upload.single('pdf'), asyncHandler(async (req, res) => {
  const course = await findCourse(req.params.courseId);
  if (!course) return notFound(res, 'Course');
  if (!canEditCourse(req.user, course)) {
    return res.status(403).json({ message: 'You cannot edit this course' });
  }

  const quiz = parseQuiz(req.body.quiz);
  const lesson = await prisma.lesson.create({
    data: {
      id: randomUUID(),
      courseId: course.id,
      title: req.body.title || 'Untitled Lesson',
      type: req.body.type || 'video',
      videoUrl: req.body.videoUrl || '',
      pdfUrl: req.file ? `/api/files/${req.file.filename}` : req.body.pdfUrl || '',
      duration: req.body.duration || '',
      order: course.lessons.length + 1,
      passingScore: quiz.passingScore,
      questions: { create: quizQuestionData(quiz.questions) }
    },
    include: { questions: true }
  });
  const updatedCourse = await findCourse(course.id);
  res.status(201).json({ course: courseDtoForUser(updatedCourse, req.user), lesson: courseDtoForUser({
    ...updatedCourse,
    lessons: [lesson],
    enrollments: []
  }, req.user).lessons[0] });
}));

router.patch('/:courseId/lessons/:lessonId', requireAuth, asyncHandler(async (req, res) => {
  const course = await findCourse(req.params.courseId);
  if (!course) return notFound(res, 'Course');
  if (!canEditCourse(req.user, course)) {
    return res.status(403).json({ message: 'You cannot edit this course' });
  }
  const existingLesson = course.lessons.find((item) => item.id === req.params.lessonId);
  if (!existingLesson) return notFound(res, 'Lesson');

  const data = {};
  for (const key of ['title', 'type', 'videoUrl', 'pdfUrl', 'duration']) {
    if (req.body[key] !== undefined) data[key] = req.body[key];
  }
  if (req.body.quiz !== undefined) {
    const quiz = parseQuiz(req.body.quiz);
    data.passingScore = quiz.passingScore;
    await prisma.$transaction(async (tx) => {
      await tx.question.deleteMany({ where: { lessonId: existingLesson.id } });
      await tx.lesson.update({
        where: { id: existingLesson.id },
        data: {
          ...data,
          questions: { create: quizQuestionData(quiz.questions) }
        }
      });
    });
  } else {
    await prisma.lesson.update({ where: { id: existingLesson.id }, data });
  }
  const updatedCourse = await findCourse(course.id);
  const lesson = updatedCourse.lessons.find((item) => item.id === existingLesson.id);
  res.json({ course: courseDtoForUser(updatedCourse, req.user), lesson: courseDtoForUser({
    ...updatedCourse,
    lessons: [lesson],
    enrollments: []
  }, req.user).lessons[0] });
}));

router.delete('/:courseId/lessons/:lessonId', requireAuth, asyncHandler(async (req, res) => {
  const course = await findCourse(req.params.courseId);
  if (!course) return notFound(res, 'Course');
  if (!canEditCourse(req.user, course)) {
    return res.status(403).json({ message: 'You cannot edit this course' });
  }
  const lesson = course.lessons.find((item) => item.id === req.params.lessonId);
  if (!lesson) return notFound(res, 'Lesson');

  await prisma.$transaction(async (tx) => {
    await tx.lesson.delete({ where: { id: lesson.id } });
    const remaining = await tx.lesson.findMany({
      where: { courseId: course.id },
      orderBy: { order: 'asc' },
      select: { id: true }
    });
    for (const [index, item] of remaining.entries()) {
      await tx.lesson.update({ where: { id: item.id }, data: { order: index + 1 } });
    }
  });
  res.json({ course: courseDtoForUser(await findCourse(course.id), req.user) });
}));

router.post('/:courseId/enroll', requireAuth, requireRole('student'), asyncHandler(async (req, res) => {
  const course = await prisma.course.findUnique({ where: { id: req.params.courseId } });
  if (!course || !course.isApproved) return notFound(res, 'Course');

  await prisma.enrollment.createMany({
    data: [{ userId: req.user.id, courseId: course.id }],
    skipDuplicates: true
  });
  const [updatedCourse, user] = await Promise.all([
    findCourse(course.id),
    getUserDto(prisma, req.user.id)
  ]);
  res.json({ course: courseDtoForUser(updatedCourse, req.user), user });
}));

router.post('/:courseId/progress/:lessonId', requireAuth, requireRole('student'), asyncHandler(async (req, res) => {
  const lesson = await prisma.lesson.findFirst({
    where: { id: req.params.lessonId, courseId: req.params.courseId },
    select: { id: true, courseId: true, type: true }
  });
  if (!lesson) return notFound(res, 'Lesson');
  if (lesson.type === 'quiz') {
    return res.status(400).json({ message: 'Submit the quiz to complete this lesson' });
  }
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: req.user.id, courseId: lesson.courseId } }
  });
  if (!enrollment) return res.status(403).json({ message: 'Enroll in this course to track lesson progress' });

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: req.user.id, lessonId: lesson.id } },
    create: { userId: req.user.id, courseId: lesson.courseId, lessonId: lesson.id },
    update: {}
  });
  res.json({ user: await getUserDto(prisma, req.user.id) });
}));

router.post('/:courseId/quiz/:lessonId', requireAuth, requireRole('student'), asyncHandler(async (req, res) => {
  const lesson = await prisma.lesson.findFirst({
    where: { id: req.params.lessonId, courseId: req.params.courseId },
    include: { questions: true }
  });
  if (!lesson) return notFound(res, 'Lesson');

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: req.user.id, courseId: lesson.courseId } }
  });
  if (!enrollment) return res.status(403).json({ message: 'Enroll in this course to submit quizzes' });

  const answers = req.body.answers;
  if (!answers || typeof answers !== 'object' || Array.isArray(answers) || !lesson.questions.length) {
    return res.status(400).json({ message: 'A valid set of quiz answers is required' });
  }
  const allQuestionsAnswered = lesson.questions.every((question) =>
    Number.isInteger(answers[question.id]) &&
    answers[question.id] >= 0 &&
    answers[question.id] < question.options.length
  );
  if (!allQuestionsAnswered) {
    return res.status(400).json({ message: 'Answer every quiz question before submitting' });
  }

  const correctAnswers = lesson.questions.reduce(
    (count, question) => count + Number(answers[question.id] === question.correctAnswer),
    0
  );
  const score = Math.round((correctAnswers / lesson.questions.length) * 100);
  const passed = score >= lesson.passingScore;

  await prisma.$transaction(async (tx) => {
    await tx.quizAttempt.upsert({
      where: { userId_lessonId: { userId: req.user.id, lessonId: lesson.id } },
      create: {
        userId: req.user.id,
        courseId: lesson.courseId,
        lessonId: lesson.id,
        answers,
        score
      },
      update: { answers, score, completedAt: new Date() }
    });

    if (passed) {
      await tx.lessonProgress.upsert({
        where: { userId_lessonId: { userId: req.user.id, lessonId: lesson.id } },
        create: { userId: req.user.id, courseId: lesson.courseId, lessonId: lesson.id },
        update: {}
      });
    }
  });
  res.json({ score, passed, user: await getUserDto(prisma, req.user.id) });
}));

router.post('/:courseId/certificate', requireAuth, requireRole('student'), asyncHandler(async (req, res) => {
  const course = await prisma.course.findUnique({
    where: { id: req.params.courseId },
    include: { lessons: { select: { id: true } } }
  });
  if (!course) return notFound(res, 'Course');

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: req.user.id, courseId: course.id } }
  });
  if (!course.isApproved || !enrollment) {
    return res.status(403).json({ message: 'Enroll in an approved course before requesting a certificate' });
  }

  const completedCount = await prisma.lessonProgress.count({
    where: { userId: req.user.id, courseId: course.id }
  });
  if (!course.lessons.length || completedCount < course.lessons.length) {
    return res.status(400).json({ message: 'Complete all lessons before generating a certificate' });
  }

  const existingCertificate = await prisma.certificate.findUnique({
    where: { userId_courseId: { userId: req.user.id, courseId: course.id } }
  });
  if (existingCertificate) {
    return res.json({
      certificate: existingCertificate,
      user: await getUserDto(prisma, req.user.id)
    });
  }

  const certificate = await prisma.certificate.create({
    data: {
      userId: req.user.id,
      courseId: course.id,
      courseName: course.title,
      studentName: req.user.name,
      instructorName: course.instructorName,
      certificateNumber: `CERT-${randomUUID()}`
    }
  });
  const user = await getUserDto(prisma, req.user.id);
  res.status(201).json({ certificate, user });
}));

export default router;
