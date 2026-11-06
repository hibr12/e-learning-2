import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export const connectDb = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing. Configure the Neon pooled connection string.');
  }
  if (!process.env.DIRECT_URL) {
    throw new Error('DIRECT_URL is missing. Configure the Neon direct connection string.');
  }

  await prisma.$connect();
  await prisma.$queryRaw`SELECT 1`;
  console.log('PostgreSQL connected');
};