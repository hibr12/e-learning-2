import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDb, prisma } from './config/db.js';
import { corsOptions } from './config/cors.js';
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import fileRoutes from './routes/fileRoutes.js';

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(cors(corsOptions));
app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, database: 'connected' });
  } catch (error) {
    console.error('Health check failed', { name: error.name, code: error.code });
    res.status(503).json({ ok: false, database: 'unavailable' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api', (_req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

app.use((err, _req, res, _next) => {
  console.error('Request failed', { name: err.name, code: err.code });
  const status = err.status || (err.name === 'MulterError' ? 400 : 500);
  res.status(status).json({
    message: status < 500 ? err.message : 'Server error'
  });
});

const startServer = async () => {
  try {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error('JWT_SECRET must be configured with at least 32 characters.');
    }
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error('PORT must be an integer between 1 and 65535.');
    }

    await connectDb();
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`API server listening on port ${port}`);
    });

    const shutdown = () => {
      server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
      });
    };
    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
  } catch (error) {
    console.error('Failed to start API server', {
      name: error.name,
      code: error.code
    });
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();