import 'dotenv/config';

const configuredOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = new Set([
  'https://e-learning-2-livid.vercel.app',
  'http://localhost:5173',
  ...configuredOrigins
]);

export const corsOptions = {
  origin: (origin, callback) => callback(null, Boolean(origin && allowedOrigins.has(origin))),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
};
