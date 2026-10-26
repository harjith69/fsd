import mongoose from 'mongoose';

const teachingWorkloadSchema = new mongoose.Schema(
  {
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: true,
      index: true,
    },
    semester: {
      type: String,
      enum: ['Odd', 'Even', 'Summer'],
      default: 'Odd',
    },
    courseCode: {
      type: String,
      required: [true, 'Course code is required'],
      trim: true,
      uppercase: true,
    },
    courseName: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
    },
    program: {
      type: String,
      default: 'B.Tech CSE',
      trim: true,
    },
    type: {
      type: String,
      enum: ['Theory', 'Lab', 'Tutorial', 'Project'],
      default: 'Theory',
    },
    hoursPerWeek: {
      type: Number,
      required: true,
      min: 0,
      default: 3,
    },
    totalHoursDelivered: {
      type: Number,
      required: true,
      min: 0,
      default: 45,
    },
    studentsCount: {
      type: Number,
      default: 60,
    },
    passPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 90,
    },
    feedbackScore: {
      type: Number,
      min: 0,
      max: 5,
      default: 4.5,
    },
    status: {
      type: String,
      enum: ['Draft', 'Submitted', 'Approved', 'Rejected'],
      default: 'Draft',
      index: true,
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

teachingWorkloadSchema.index({ faculty: 1, academicYear: 1 });

export const TeachingWorkload = mongoose.model('TeachingWorkload', teachingWorkloadSchema);
