import express from 'express';
import { prisma } from '../config/db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler, notFound } from '../utils/errors.js';
import { courseInclude, getUserDto, toCourseDto } from '../utils/serializers.js';

const router = express.Router();

router.use(requireAuth, requireRole('admin'));

router.get('/users', asyncHandler(async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true }
  });
  res.json({ users: await Promise.all(users.map(({ id }) => getUserDto(prisma, id))) });
}));

router.patch('/users/:userId', asyncHandler(async (req, res) => {
  const data = {};
  for (const key of ['isApproved', 'isBlocked']) {
    if (typeof req.body[key] === 'boolean') data[key] = req.body[key];
  }

  try {
    await prisma.user.update({ where: { id: req.params.userId }, data });
  } catch (error) {
    if (error.code === 'P2025') return notFound(res, 'User');
    throw error;
  }
  res.json({ user: await getUserDto(prisma, req.params.userId) });
}));

router.patch('/courses/:courseId', asyncHandler(async (req, res) => {
  const data = {};
  if (typeof req.body.isApproved === 'boolean') data.isApproved = req.body.isApproved;

  try {
    await prisma.course.update({ where: { id: req.params.courseId }, data });
  } catch (error) {
    if (error.code === 'P2025') return notFound(res, 'Course');
    throw error;
  }
  const course = await prisma.course.findUnique({
    where: { id: req.params.courseId },
    include: courseInclude
  });
  res.json({ course: toCourseDto(course, { includeCorrectAnswers: true }) });
}));

export default router;
