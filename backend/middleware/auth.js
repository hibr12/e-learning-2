import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const getToken = (req) => {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
};

export const optionalAuth = async (req, _res, next) => {
  const token = getToken(req);

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
  } catch {
    req.user = null;
  }

  next();
};

export const requireAuth = async (req, res, next) => {
  const token = getToken(req);

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.isBlocked) {
      return res.status(401).json({ message: 'Invalid or blocked account' });
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid session' });
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'You do not have permission for this action' });
  }
  next();
};
