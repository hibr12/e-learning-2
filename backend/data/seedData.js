export const seedUsers = [
  {
    name: 'Admin User',
    email: 'admin@edulearn.com',
    password: 'admin123',
    role: 'admin',
    isApproved: true,
    isBlocked: false
  },
  {
    name: 'John Smith',
    email: 'john@edulearn.com',
    password: 'instructor123',
    role: 'instructor',
    isApproved: true,
    isBlocked: false,
    bio: 'Senior Web Developer with 10+ years of experience'
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah@edulearn.com',
    password: 'instructor123',
    role: 'instructor',
    isApproved: true,
    isBlocked: false,
    bio: 'Data Scientist and Python expert'
  },
  {
    name: 'Demo Student',
    email: 'student@edulearn.com',
    password: 'student123',
    role: 'student',
    isApproved: true,
    isBlocked: false,
    enrolledCourses: [],
    progress: {},
    certificates: [],
    completedQuizzes: {}
  }
];

export const seedCourses = [
  {
    title: 'React Fundamentals',
    description: 'Learn the basics of React including components, props, state, and hooks. Perfect for beginners who want to start their journey in modern web development.',
    category: 'Web Development',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
    instructorId: 'seed-john',
    instructorName: 'John Smith',
    isApproved: true,
    enrolledStudents: [],
    lessons: [
      {
        id: 'lesson-1-1',
        title: 'Introduction to React',
        type: 'video',
        videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0',
        duration: '15:30',
        order: 1
      },
      {
        id: 'lesson-1-2',
        title: 'Components and Props',
        type: 'video',
        videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0',
        duration: '20:00',
        order: 2
      },
      {
        id: 'lesson-1-3',
        title: 'React Basics PDF',
        type: 'pdf',
        pdfUrl: '/sample.pdf',
        order: 3
      },
      {
        id: 'lesson-1-4',
        title: 'React Fundamentals Quiz',
        type: 'quiz',
        quiz: {
          questions: [
            {
              id: 'q1',
              question: 'What is JSX?',
              options: ['A JavaScript XML syntax extension', 'A new programming language', 'A CSS framework', 'A database system'],
              correctAnswer: 0
            },
            {
              id: 'q2',
              question: 'Which hook is used for state management in functional components?',
              options: ['useEffect', 'useState', 'useContext', 'useReducer'],
              correctAnswer: 1
            },
            {
              id: 'q3',
              question: 'What is the virtual DOM?',
              options: ['A copy of the real DOM in memory', 'A CSS property', 'A JavaScript library', 'A browser feature'],
              correctAnswer: 0
            }
          ],
          passingScore: 70
        },
        order: 4
      }
    ]
  },
  {
    title: 'JavaScript Mastery',
    description: 'Master JavaScript from basics to advanced concepts including ES6+, async programming, and design patterns.',
    category: 'Programming',
    thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400',
    instructorId: 'seed-john',
    instructorName: 'John Smith',
    isApproved: true,
    enrolledStudents: [],
    lessons: [
      {
        id: 'lesson-2-1',
        title: 'JavaScript Basics',
        type: 'video',
        videoUrl: 'https://www.youtube.com/embed/W6NZfCO5SIk',
        duration: '25:00',
        order: 1
      },
      {
        id: 'lesson-2-2',
        title: 'ES6 Features',
        type: 'video',
        videoUrl: 'https://www.youtube.com/embed/W6NZfCO5SIk',
        duration: '30:00',
        order: 2
      }
    ]
  },
  {
    title: 'Python for Data Science',
    description: 'Learn Python programming with focus on data analysis, visualization, and machine learning basics.',
    category: 'Data Science',
    thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400',
    instructorId: 'seed-sarah',
    instructorName: 'Sarah Johnson',
    isApproved: true,
    enrolledStudents: [],
    lessons: [
      {
        id: 'lesson-3-1',
        title: 'Python Basics',
        type: 'video',
        videoUrl: 'https://www.youtube.com/embed/kqtD5dpn9C8',
        duration: '20:00',
        order: 1
      }
    ]
  }
];
