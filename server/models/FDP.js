import mongoose from 'mongoose';

const fdpSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: [true, 'FDP/Workshop title is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['Attended', 'Organized', 'Resource Person'],
      default: 'Attended',
    },
    organizer: {
      type: String,
      required: [true, 'Organizer institution/body is required'],
      trim: true,
    },
    mode: {
      type: String,
      enum: ['Online', 'Offline'],
      default: 'Offline',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    durationDays: {
      type: Number,
      required: true,
      min: 1,
      default: 5,
    },
    certificateUrl: {
      type: String,
      default: '',
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

fdpSchema.index({ faculty: 1, academicYear: 1 });

export const FDP = mongoose.model('FDP', fdpSchema);
