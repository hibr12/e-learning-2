export const userInclude = {
  enrollments: { select: { courseId: true } },
  lessonProgress: { select: { courseId: true, lessonId: true } },
  quizAttempts: true,
  certificates: true
};

export const courseInclude = {
  lessons: {
    include: { questions: true },
    orderBy: { order: 'asc' }
  },
  enrollments: { select: { userId: true } }
};

export const toUserDto = (user) => {
  if (!user) return null;

  const progress = {};
  for (const enrollment of user.enrollments || []) {
    const completedLessons = (user.lessonProgress || [])
      .filter((entry) => entry.courseId === enrollment.courseId)
      .map((entry) => entry.lessonId);
    progress[enrollment.courseId] = {
      completedLessons,
      percentage: user.courseLessonCounts?.[enrollment.courseId]
        ? Math.round((completedLessons.length / user.courseLessonCounts[enrollment.courseId]) * 100)
        : 0
    };
  }

  const completedQuizzes = Object.fromEntries(
    (user.quizAttempts || []).map((attempt) => [
      `${attempt.courseId}-${attempt.lessonId}`,
      { answers: attempt.answers, score: attempt.score, completedAt: attempt.completedAt.toISOString() }
    ])
  );

  const {
    password: _password,
    enrollments,
    lessonProgress,
    quizAttempts,
    courseLessonCounts,
    ...publicUser
  } = user;
  return {
    ...publicUser,
    enrolledCourses: (enrollments || []).map((entry) => entry.courseId),
    progress,
    completedQuizzes,
    certificates: user.certificates || []
  };
};

export const toCourseDto = (course, { includeCorrectAnswers = false } = {}) => {
  if (!course) return null;
  const { enrollments, lessons, ...courseFields } = course;
  return {
    ...courseFields,
    enrolledStudents: (enrollments || []).map((entry) => entry.userId),
    lessons: (lessons || []).map((lesson) => {
      const { questions, passingScore, ...lessonFields } = lesson;
      return {
        ...lessonFields,
        quiz: {
          passingScore,
          questions: (questions || []).map(({ id, question, options, correctAnswer }) => ({
            id,
            question,
            options,
            ...(includeCorrectAnswers ? { correctAnswer } : {})
          }))
        }
      };
    })
  };
};

export const getUserDto = async (tx, userId) => {
  const user = await tx.user.findUnique({
    where: { id: userId },
    include: userInclude
  });
  if (!user) return null;

  const courseIds = user.enrollments.map(({ courseId }) => courseId);
  const counts = courseIds.length
    ? await tx.lesson.groupBy({
      by: ['courseId'],
      where: { courseId: { in: courseIds } },
      _count: { _all: true }
    })
    : [];
  user.courseLessonCounts = Object.fromEntries(counts.map((row) => [row.courseId, row._count._all]));
  return toUserDto(user);
};
