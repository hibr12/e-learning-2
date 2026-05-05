import express from 'express';
import User from '../models/User.js';
import Course from '../models/Course.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler, notFound } from '../utils/errors.js';

const router = express.Router();

router.use(requireAuth, requireRole('admin'));

router.get('/users', asyncHandler(async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ users });
}));

router.patch('/users/:userId', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) return notFound(res, 'User');

  ['isApproved', 'isBlocked'].forEach((key) => {
    if (req.body[key] !== undefined) {
      user[key] = req.body[key];
    }
  });

  await user.save();
  res.json({ user });
}));

router.patch('/courses/:courseId', asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) return notFound(res, 'Course');

  ['isApproved'].forEach((key) => {
    if (req.body[key] !== undefined) {
      course[key] = req.body[key];
    }
  });

  await course.save();
  res.json({ course });
}));

export default router;
