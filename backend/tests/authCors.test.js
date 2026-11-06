import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import express from 'express';
import { prisma } from '../config/db.js';
import { corsOptions } from '../config/cors.js';
import authRoutes from '../routes/authRoutes.js';

const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.use('/api/auth', authRoutes);

let server;
let baseUrl;

before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
});

test('login preflight allows the production frontend and required headers', async () => {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'OPTIONS',
    headers: {
      Origin: 'https://e-learning-2-livid.vercel.app',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type,authorization'
    }
  });

  assert.equal(response.status, 204);
  assert.equal(
    response.headers.get('access-control-allow-origin'),
    'https://e-learning-2-livid.vercel.app'
  );
  assert.equal(response.headers.get('access-control-allow-credentials'), 'true');
  assert.match(response.headers.get('access-control-allow-methods'), /\bPOST\b/);
  assert.match(response.headers.get('access-control-allow-methods'), /\bOPTIONS\b/);
  assert.match(response.headers.get('access-control-allow-headers'), /content-type/i);
  assert.match(response.headers.get('access-control-allow-headers'), /authorization/i);
});

test('POST /api/auth/login reaches the existing login route', async () => {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: {
      Origin: 'https://e-learning-2-livid.vercel.app',
      'Content-Type': 'application/json'
    },
    body: '{}'
  });

  assert.equal(response.status, 400);
  assert.equal(
    response.headers.get('access-control-allow-origin'),
    'https://e-learning-2-livid.vercel.app'
  );
  assert.deepEqual(await response.json(), { message: 'Email and password are required' });
});

test('successful login still returns a user and JWT', async () => {
  const originalFindUnique = prisma.user.findUnique;
  const originalGroupBy = prisma.lesson.groupBy;
  const originalJwtSecret = process.env.JWT_SECRET;
  const password = 'test-only-password';
  const user = {
    id: 'test-user',
    name: 'Test Student',
    email: 'student@example.test',
    password: await bcrypt.hash(password, 4),
    role: 'student',
    bio: '',
    isApproved: true,
    isBlocked: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    enrollments: [],
    lessonProgress: [],
    quizAttempts: [],
    certificates: []
  };

  process.env.JWT_SECRET = 'test-only-secret-that-is-long-enough-123';
  prisma.user.findUnique = async () => user;
  prisma.lesson.groupBy = async () => [];

  try {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        Origin: 'https://e-learning-2-livid.vercel.app',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: user.email, password })
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.user.id, user.id);
    assert.equal(typeof body.token, 'string');
    assert.ok(body.token.length > 0);
    assert.equal('password' in body.user, false);
    assert.equal(
      response.headers.get('access-control-allow-origin'),
      'https://e-learning-2-livid.vercel.app'
    );
  } finally {
    prisma.user.findUnique = originalFindUnique;
    prisma.lesson.groupBy = originalGroupBy;
    if (originalJwtSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalJwtSecret;
    }
  }
});
