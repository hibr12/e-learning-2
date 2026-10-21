import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDb } from './config/db.js';
import { seedDatabase } from './seed.js';
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: [
    "http://localhost:5173",                 // local dev
    "https://e-learning-2-livid.vercel.app"  // deployed frontend
  ],
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, database: 'connected' });
});

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

connectDb().then(() => {
  seedDatabase().then(() => {
    app.listen(port, () => {
      console.log(`API server running on http://localhost:${port}`);
    });
  }).catch(err => {
    console.error('Failed to seed database', err);
    process.exit(1);
  });
}).catch(err => {
  console.error('Failed to connect to database', err);
  process.exit(1);
});