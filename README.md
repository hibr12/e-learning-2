# EduLearn - Online Learning Platform

A comprehensive web-based e-learning management system built with React (Vite). This platform supports three user roles: Students, Instructors, and Admins.

##  Features

###  Student Features

- Create account / Login with role selection
- Browse and search courses with filters
- Enroll in courses (one-click enrollment)
- Watch video lessons (YouTube embeds)
- Download PDF materials
- Take quizzes with auto-grading
- Track progress with visual progress bars
- Earn and download certificates

###  Instructor Features

- Create and manage courses
- Upload video lessons (YouTube embed URLs)
- Upload PDF resources
- Create quizzes with multiple choice questions
- Edit and delete lessons
- View enrolled students
- Track course performance

### 🛠 Admin Features

- Manage all users (students and instructors)
- Approve/reject instructor registrations
- Approve/reject courses before publishing
- Block/unblock users
- View platform statistics and reports

##  Course Structure

```
Course
 ┣ Title
 ┣ Description
 ┣ Category
 ┣ Thumbnail
 ┣ Lessons
 ┃   ┣ Video (YouTube embed)
 ┃   ┣ PDF (downloadable)
 ┃   ┗ Quiz (multiple choice)
 ┗ Certificate (auto-generated)
```

## 🛠 Technology Stack

- **Frontend Framework:** React 19 with Vite 7
- **Routing:** React Router DOM v7
- **Icons:** React Icons
- **Styling:** Custom CSS with modern design
- **State Management:** React Context API
- **Data Storage:** Neon PostgreSQL through Prisma
- **Authentication:** JWT with bcrypt-hashed passwords

##  Project Structure

```
src/
 ┣ components/
 ┃   ┣ Navbar.jsx
 ┃   ┣ ProtectedRoute.jsx
 ┃   ┗ CourseCard.jsx
 ┣ context/
 ┃   ┣ AuthContext.jsx
 ┃   ┗ DataContext.jsx
 ┣ pages/
 ┃   ┣ Home.jsx
 ┃   ┣ Login.jsx
 ┃   ┣ Register.jsx
 ┃   ┣ Courses.jsx
 ┃   ┣ CourseDetails.jsx
 ┃   ┣ Lesson.jsx
 ┃   ┣ Certificate.jsx
 ┃   ┣ student/
 ┃   ┃   ┗ StudentDashboard.jsx
 ┃   ┣ instructor/
 ┃   ┃   ┣ InstructorDashboard.jsx
 ┃   ┃   ┣ CreateCourse.jsx
 ┃   ┃   ┗ EditCourse.jsx
 ┃   ┗ admin/
 ┃       ┗ AdminDashboard.jsx
 ┣ App.jsx
 ┣ App.css
 ┣ main.jsx
 ┗ index.css
```

##  Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Local development

Use Node.js 22 LTS (both package manifests require Node 22.12 or newer) and npm. From the project root:

```powershell
Copy-Item backend\.env.example backend\.env
```

Set `DATABASE_URL`, `DIRECT_URL`, and a unique random `JWT_SECRET` (at least 32 characters) in `backend\.env`. Generate one with `node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"`. Keep this file private and out of source control. Then:

```powershell
cd backend
npm ci
npx prisma migrate deploy
npm run dev
```

In another terminal, from the project root, run `npm ci` and `npm run dev` to start the frontend and backend together. Run `npm run seed` only for a throwaway development database; it creates well-known demo credentials and must never be run against production.

## Production deployment (Render API + Vercel frontend)

Use separate services: a PostgreSQL database (the current setup uses Neon), an API service, and a static frontend. Deploy a staging environment first and verify it before sending users to production.

### 1. Prepare the database

- Create a production PostgreSQL database and keep its credentials private.
- Use the pooled connection string for `DATABASE_URL` and the direct connection string for `DIRECT_URL`.
- Back up any existing database before changing schemas or importing data.
- The project uses Prisma migrations. On a new empty database, run `npx prisma migrate deploy` before switching traffic. If tables already exist, do not run the initial migration blindly: back up the database, verify its schema matches the migration, then baseline it with `npx prisma migrate resolve --applied 20261106200000_init`. If it differs, create and review a data-preserving migration first. Do not run `prisma migrate dev` or seed demo users in production.
- MongoDB data is not automatically migrated. If replacing an existing MongoDB deployment, plan and test a separate export/transform/import, then verify record counts and relationships before cutover.

### 2. Deploy the backend to Render

- Create a **Web Service** from this repository and set its root directory to `backend`.
- Use Node.js 22 LTS.
- Build command: `npm ci && npx prisma generate`
- Pre-deploy command for this login/CORS-only release: none; it makes no database schema changes.
- Start command: `npm start`
- Set these service environment variables:
  - `NODE_ENV=production`
  - `DATABASE_URL` (production pooled PostgreSQL URL)
  - `DIRECT_URL` (production direct PostgreSQL URL)
  - `JWT_SECRET` (a cryptographically random secret, at least 32 characters; never reuse the example value)
  - `CORS_ORIGINS` (optional comma-separated additional trusted origins; the production Vercel origin and `http://localhost:5173` are explicitly allowed by the server)
  - `UPLOADS_DIR=/var/data/uploads` if using a mounted Render persistent disk at `/var/data`
- Attach a persistent disk at `/var/data` before enabling PDF uploads. Without persistent storage, local uploads can disappear on redeploy/restart. For multiple API instances or larger deployments, use managed object storage instead.
- Render supplies `PORT`; the server binds to `0.0.0.0`. After deployment, verify `https://YOUR-API.onrender.com/api/health` returns HTTP 200 and `{"ok":true,"database":"connected"}`.
- The login/CORS fix changes no database schema; do not run a database migration for this code-only deployment.

### 3. Deploy the frontend to Vercel

- Import the repository and set the project root directory to `frontend`.
- Set Vercel's Node.js version to 22.x to satisfy `engines.node >=22.12.0`. A version override below that minimum could break the build, but it does not cause the observed OPTIONS 404.
- Build command: `npm run build`; output directory: `dist`.
- Set `VITE_API_URL=https://e-learning-2-jm8l.onrender.com` in the Vercel production environment. Do not append `/api`; the frontend adds that prefix if it is missing. This value is public frontend configuration, not a secret. The older `VITE_API_BASE_URL` name is also supported for existing environments.
- Deploy the frontend and backend after setting their configuration.
- Test direct navigation and refresh on nested routes, registration/login, course browsing, enrollment, quiz submission, certificates, and PDF access.

The backend login endpoint is `POST /api/auth/login`. `VITE_API_URL` (or the legacy `VITE_API_BASE_URL`) is the backend origin; frontend requests append `/api` exactly once. The development fallback is `/api`, which the Vite dev server proxies to `http://localhost:5000`.

After both deployments, verify the API preflight with:

```powershell
curl.exe -i -X OPTIONS https://e-learning-2-jm8l.onrender.com/api/auth/login `
  -H "Origin: https://e-learning-2-livid.vercel.app" `
  -H "Access-Control-Request-Method: POST" `
  -H "Access-Control-Request-Headers: content-type,authorization"
```

Expect HTTP 204, `Access-Control-Allow-Origin: https://e-learning-2-livid.vercel.app`, allowed methods including `POST`, `Access-Control-Allow-Headers` including `Content-Type` and `Authorization`, and `Access-Control-Allow-Credentials: true`. Then log in through the Vercel app and confirm the Network tab sends `POST https://e-learning-2-jm8l.onrender.com/api/auth/login` after the successful OPTIONS request.

### 4. Before opening production

- Register a new account, then promote that account to the initial admin using a controlled database session (substitute the exact email):

  ```sql
  UPDATE "User"
  SET "role" = 'admin', "isApproved" = true
  WHERE "email" = 'your-admin@example.com';
  ```

  Verify exactly one row changed, then sign out and sign back in. Never expose or use the seeded demo admin credentials.
- Confirm HTTPS is enabled, environment secrets are set only in provider dashboards, database backups are configured, and the health check is monitored.
- Test the full student/instructor/admin workflows in staging, including a failed quiz and a passing quiz. Confirm an instructor cannot self-approve a course and students cannot retrieve quiz answer keys.
- Resolve the remaining high-severity Prisma 6.19 CLI dependency advisories before public launch; the available fix is a major Prisma upgrade and needs its own schema/client validation.
- Set up error monitoring and alerting, review database/storage usage, and document a rollback plan. Rehearse restoring a database backup before relying on it.
- If changing any secret or database URL, update the provider environment and redeploy; rotate credentials immediately if they were ever committed or shared.

##  Development Demo Accounts

`npm run seed` creates the following demo accounts for local development only. Never run the seed script against a production database:

| Role       | Email                | Password      |
| ---------- | -------------------- | ------------- |
| Admin      | admin@edulearn.com   | admin123      |
| Instructor | john@edulearn.com    | instructor123 |
| Student    | student@edulearn.com | student123    |

##  Pages Overview

### Public Pages

- **Home** (`/`) - Landing page with featured courses
- **Courses** (`/courses`) - Browse all approved courses
- **Course Details** (`/course/:id`) - View course information and lessons
- **Login** (`/login`) - User authentication
- **Register** (`/register`) - New user registration

### Student Pages

- **Dashboard** (`/student/dashboard`) - Overview of enrolled courses and progress
- **Lesson** (`/course/:id/lesson/:lessonId`) - Video/PDF viewer and quiz
- **Certificate** (`/certificate/:id`) - View and download certificate

### Instructor Pages

- **Dashboard** (`/instructor/dashboard`) - Manage courses and view stats
- **Create Course** (`/instructor/create-course`) - Create new course
- **Edit Course** (`/instructor/edit-course/:id`) - Edit existing course

### Admin Pages

- **Dashboard** (`/admin/dashboard`) - Platform management with tabs for:
  - Overview statistics
  - Student management
  - Instructor management (with approval system)
  - Course management (with approval system)

##  Functional Requirements

### Authentication

- ✅ Login / Register
- ✅ Role-based access control
- ✅ Protected routes
- ✅ Password encoding

### Course Management

- ✅ CRUD operations for courses
- ✅ Lesson management (video, PDF, quiz)
- ✅ Course approval workflow

### Enrollment System

- ✅ One-click enrollment
- ✅ Duplicate enrollment prevention
- ✅ Enrollment tracking

### Progress Tracking

- ✅ Mark lessons as complete
- ✅ Progress percentage calculation
- ✅ Visual progress bars

### Quiz System

- ✅ Multiple choice questions
- ✅ Auto-grading
- ✅ Score tracking
- ✅ Passing score requirement

### Certificate Generation

- ✅ Auto-generated upon course completion
- ✅ Student name and course name
- ✅ Completion date
- ✅ Certificate number
- ✅ Printable format

##  UI/UX Features

- ✅ Modern, clean design
- ✅ Responsive layout (mobile-friendly)
- ✅ Smooth animations and transitions
- ✅ Intuitive navigation
- ✅ Loading states
- ✅ Error handling
- ✅ Form validation

##  Security Notes

- Passwords are hashed with bcrypt; API access uses signed JWTs and role checks.
- Quiz scores are calculated on the server and answer keys are not returned to students.
- Production CORS origins and JWT secret are required at backend startup.
- Configure HTTPS, production secrets, database backups, and persistent/object storage before launch.

##  Future Enhancements

- [x] PostgreSQL integration
- [ ] Real-time notifications
- [ ] Discussion forums
- [ ] Instructor ratings and reviews
- [ ] Payment integration
- [ ] Video upload functionality
- [ ] Dark mode support
- [ ] Multi-language support

##  Learning Outcomes

This project demonstrates:

- Component-based architecture
- Authentication systems
- State management with Context API
- Client-side routing
- Form handling and validation
- Responsive design
- Role-based access control

##  License

This project is created for educational purposes.

---

Built with  using React and Vite
