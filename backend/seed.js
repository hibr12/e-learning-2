import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { prisma } from './config/db.js';
import { seedCourses, seedUsers } from './data/seedData.js';

export const seedDatabase = async () => {
  const usersByEmail = new Map();
  for (const seedUser of seedUsers) {
    const user = await prisma.user.upsert({
      where: { email: seedUser.email },
      update: {},
      create: {
        name: seedUser.name,
        email: seedUser.email,
        password: await bcrypt.hash(seedUser.password, 10),
        role: seedUser.role,
        isApproved: seedUser.isApproved ?? false,
        isBlocked: seedUser.isBlocked ?? false,
        bio: seedUser.bio || ''
      }
    });
    usersByEmail.set(user.email, user);
  }

  if (await prisma.course.count() > 0) return;

  const instructorBySeedId = {
    'seed-john': usersByEmail.get('john@edulearn.com'),
    'seed-sarah': usersByEmail.get('sarah@edulearn.com')
  };
  for (const seedCourse of seedCourses) {
    const { lessons, instructorId, enrolledStudents: _enrolledStudents, ...courseData } = seedCourse;
    const instructor = instructorBySeedId[instructorId];
    if (!instructor) {
      throw new Error(`Missing seeded instructor for course "${seedCourse.title}"`);
    }

    await prisma.course.create({
      data: {
        ...courseData,
        instructorId: instructor.id,
        lessons: {
          create: lessons.map((lesson) => {
            const { quiz = {}, ...lessonData } = lesson;
            return {
              ...lessonData,
              passingScore: quiz.passingScore ?? 70,
              questions: {
                create: (quiz.questions || []).map((question) => ({
                  id: question.id,
                  question: question.question,
                  options: question.options,
                  correctAnswer: question.correctAnswer ?? 0
                }))
              }
            };
          })
        }
      }
    });
  }

  console.log('Seeded demo users and courses');
};

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    await seedDatabase();
  } finally {
    await prisma.$disconnect();
  }
}
