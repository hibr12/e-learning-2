# Online Learning Platform - Analysis Report

## Architecture Overview
- **Backend**: Express.js + MongoDB (Mongoose) REST API running on port 5000
- **Frontend**: React (Vite) dev server running on port 5173 with proxy to backend
- **Connection**: Frontend uses `VITE_API_URL` env var (defaults to `/api`), Vite proxy forwards `/api` requests to `http://localhost:5000`

## Backend Routes
| Prefix | File | Description |
|--------|------|-------------|
| `/api/auth` | `authRoutes.js` | register, login, me (GET/PATCH) |
| `/api/courses` | `courseRoutes.js` | CRUD courses, lessons, enroll, progress, quiz, certificate |
| `/api/admin` | `adminRoutes.js` | Manage users, approve courses |

## Frontend Context Data Flow
- `AuthContext` - auth state, login/register/logout
- `DataContext` - courses, users, CRUD operations, progress tracking
- `api.js` - low-level HTTP client (`apiRequest` + helper functions)

---

## Issues Found & Fixed

### Issue 1: HTTP Method Mismatch - `updateCourse` in `api.js`
**File**: `frontend/src/services/api.js`
**Problem**: The exported `updateCourse` function uses `method: 'PUT'` but the backend route `PATCH /api/courses/:courseId` expects `PATCH`.
**Note**: `DataContext.jsx` correctly uses `PATCH`, so only direct calls to `api.js`'s `updateCourse` fail.
**Fix**: Changed `PUT` → `PATCH`.

### Issue 2: Dead commented-out code in `api.js`
**File**: `frontend/src/services/api.js` (lines 1-36)
**Problem**: Two identical versions of the helper functions exist - one commented out, one active. Unnecessary clutter.
**Fix**: Removed the commented-out duplicate code block.

### Issue 3: Certificate Subdocument - Missing `id` field
**File**: `backend/models/User.js`
**Problem**: The `certificateSchema` subdocuments use `{ _id: true }` (default) but lack a `toJSON` transform. The User's toJSON transform only handles top-level fields. When the API returns user data, certificates have `_id` (ObjectId/string) but NOT an `id` field. The frontend (`Certificate.jsx`, `StudentDashboard.jsx`, `CourseDetails.jsx`) all try to access `certificate.id` or navigate via `cert.id`, which is `undefined`.
**Fix**: Added a `toJSON` transform to `certificateSchema` that maps `_id` → `id`.

### Issue 4: Non-existent route `/student/courses`
**File**: `frontend/src/pages/student/StudentDashboard.jsx` (line 108)
**Problem**: The "View All" link in "My Courses" section points to `/student/courses`, but no such route exists in `App.jsx`.
**Fix**: Changed the link to point to the existing `/courses` route (minor UI fix).