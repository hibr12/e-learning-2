import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    question: { type: String, required: true },
    options: [{ type: String }],
    correctAnswer: { type: Number, default: 0 }
  },
  { _id: false }
);

const lessonSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    type: { type: String, enum: ['video', 'pdf', 'quiz'], default: 'video' },
    videoUrl: { type: String, default: '' },
    pdfUrl: { type: String, default: '' },
    duration: { type: String, default: '' },
    order: { type: Number, default: 1 },
    quiz: {
      questions: [questionSchema],
      passingScore: { type: Number, default: 70 }
    }
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    thumbnail: { type: String, default: '' },
    instructorId: { type: String, required: true },
    instructorName: { type: String, required: true },
    isApproved: { type: Boolean, default: false },
    enrolledStudents: [{ type: String }],
    lessons: [lessonSchema]
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

export default mongoose.model('Course', courseSchema);
