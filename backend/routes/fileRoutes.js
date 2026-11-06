import express from 'express';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { prisma } from '../config/db.js';
import { optionalAuth } from '../middleware/auth.js';
import { asyncHandler, notFound } from '../utils/errors.js';
import { uploadsDir } from '../utils/uploadStorage.js';

const router = express.Router();

router.get('/:filename', optionalAuth, asyncHandler(async (req, res, next) => {
  const { filename } = req.params;
  if (path.basename(filename) !== filename) return notFound(res, 'File');

  const pdfUrl = `/api/files/${filename}`;
  const lesson = await prisma.lesson.findFirst({
    where: { pdfUrl },
    include: { course: { include: { enrollments: { select: { userId: true } } } } }
  });
  if (!lesson || !existsSync(path.join(uploadsDir, filename))) return notFound(res, 'File');

  const user = req.user;
  const authorized = user && (
    user.role === 'admin' ||
    (user.role === 'instructor' && lesson.course.instructorId === user.id) ||
    lesson.course.enrollments.some(({ userId }) => userId === user.id)
  );
  if (!authorized) {
    return res.status(user ? 403 : 401).json({
      message: user ? 'You must be enrolled in this course to access its materials' : 'Authentication required'
    });
  }

  res.type('application/pdf');
  res.download(path.join(uploadsDir, filename), 'lesson-materials.pdf', (error) => {
    if (error && !res.headersSent) next(error);
  });
}));

export default router;
