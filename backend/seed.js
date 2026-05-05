import bcrypt from 'bcryptjs';
import Course from './models/Course.js';
import User from './models/User.js';
import { seedCourses, seedUsers } from './data/seedData.js';

export const seedDatabase = async () => {
  const userCount = await User.countDocuments();
  const courseCount = await Course.countDocuments();

  if (userCount > 0 || courseCount > 0) {
    return;
  }

  const users = await User.insertMany(
    await Promise.all(
      seedUsers.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10)
      }))
    )
  );

  const john = users.find((user) => user.email === 'john@edulearn.com');
  const sarah = users.find((user) => user.email === 'sarah@edulearn.com');

  await Course.insertMany(
    seedCourses.map((course) => ({
      ...course,
      instructorId: course.instructorId === 'seed-sarah' ? sarah.id : john.id
    }))
  );

  console.log('Seeded demo users and courses');
};
