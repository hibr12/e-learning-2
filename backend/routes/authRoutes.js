import express from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/errors.js';
import { createToken } from '../utils/tokens.js';
import { getUserDto, userInclude } from '../utils/serializers.js';

const router = express.Router();
const validRoles = ['student', 'instructor'];

router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password, role = 'student', bio = '' } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: 'Role must be student or instructor' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existingUser) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  let user;
  try {
    user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: await bcrypt.hash(password, 10),
        role,
        bio,
        isApproved: role === 'student'
      },
      include: userInclude
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Email already registered' });
    }
    throw error;
  }

  const userDto = await getUserDto(prisma, user.id);
  const payload = { user: userDto };
  if (user.isApproved) {
    payload.token = createToken(user);
  }

  res.status(201).json(payload);
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    include: userInclude
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  if (user.isBlocked) {
    return res.status(403).json({ message: 'Your account has been blocked. Please contact admin.' });
  }

  if (!user.isApproved) {
    return res.status(403).json({ message: 'Your account is pending approval. Please wait for admin approval.' });
  }

  res.json({ user: await getUserDto(prisma, user.id), token: createToken(user) });
}));

router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  res.json({ user: await getUserDto(prisma, req.user.id) });
}));

router.patch('/me', requireAuth, asyncHandler(async (req, res) => {
  const data = {};
  for (const key of ['name', 'bio']) {
    if (req.body[key] !== undefined) data[key] = req.body[key];
  }
  if (typeof data.name === 'string') data.name = data.name.trim();

  await prisma.user.update({ where: { id: req.user.id }, data });
  res.json({ user: await getUserDto(prisma, req.user.id) });
}));

export default router;
