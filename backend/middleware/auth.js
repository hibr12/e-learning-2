import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';

const getToken = (req) => {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};

export const optionalAuth = async (req, _res, next) => {
  const token = getToken(req);
  if (token) {
    const decoded = verifyToken(token);
    if (decoded?.id) {
      req.user = await prisma.user.findUnique({ where: { id: decoded.id } });
    }
  }
  next();
};

export const requireAuth = async (req, res, next) => {
  const token = getToken(req);
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const decoded = verifyToken(token);
  if (!decoded?.id) {
    return res.status(401).json({ message: 'Invalid session' });
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user || user.isBlocked) {
    return res.status(401).json({ message: 'Invalid or blocked account' });
  }

  req.user = user;
  next();
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'You do not have permission for this action' });
  }
  next();
};
