import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema(
  {
    courseId: { type: String, required: true },
    courseName: { type: String, required: true },
    studentName: { type: String, required: true },
    instructorName: { type: String, required: true },
    completedAt: { type: Date, default: Date.now },
    certificateNumber: { type: String, required: true }
  },
  {
    _id: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      }
    }
  }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' },
    bio: { type: String, default: '' },
    isApproved: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    enrolledCourses: [{ type: String }],
    progress: { type: mongoose.Schema.Types.Mixed, default: {} },
    certificates: [certificateSchema],
    completedQuizzes: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      }
    }
  }
);

export default mongoose.model('User', userSchema);
