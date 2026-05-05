import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/errors.js';
import { createToken } from '../utils/tokens.js';

const router = express.Router();

router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password, role = 'student', bio = '' } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  const user = await User.create({
    name,
    email,
    password: await bcrypt.hash(password, 10),
    role,
    bio,
    isApproved: role === 'student',
    enrolledCourses: [],
    progress: {},
    certificates: [],
    completedQuizzes: {}
  });

  const payload = { user: user.toJSON() };
  if (user.isApproved) {
    payload.token = createToken(user);
  }

  res.status(201).json(payload);
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  if (user.isBlocked) {
    return res.status(403).json({ message: 'Your account has been blocked. Please contact admin.' });
  }

  if (!user.isApproved) {
    return res.status(403).json({ message: 'Your account is pending approval. Please wait for admin approval.' });
  }

  res.json({ user: user.toJSON(), token: createToken(user) });
}));

router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  res.json({ user: req.user.toJSON() });
}));

router.patch('/me', requireAuth, asyncHandler(async (req, res) => {
  const allowed = ['name', 'bio'];
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) {
      req.user[key] = req.body[key];
    }
  });

  await req.user.save();
  res.json({ user: req.user.toJSON() });
}));

export default router;
