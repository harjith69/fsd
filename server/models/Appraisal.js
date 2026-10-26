import mongoose from 'mongoose';

const appraisalSchema = new mongoose.Schema(
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
    selfScores: {
      teaching: { type: Number, default: 0 },
      publications: { type: Number, default: 0 },
      fdp: { type: Number, default: 0 },
      consultancy: { type: Number, default: 0 },
      patents: { type: Number, default: 0 },
      feedback: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    hodScores: {
      teaching: { type: Number, default: 0 },
      publications: { type: Number, default: 0 },
      fdp: { type: Number, default: 0 },
      consultancy: { type: Number, default: 0 },
      patents: { type: Number, default: 0 },
      feedback: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    finalScore: {
      type: Number,
      default: 0,
    },
    grade: {
      type: String,
      enum: ['Outstanding', 'Very Good', 'Good', 'Needs Improvement', 'Pending'],
      default: 'Pending',
    },
    comments: {
      type: String,
      default: '',
    },
    submittedAt: {
      type: Date,
      default: () => new Date(),
    },
    status: {
      type: String,
      enum: ['Draft', 'Submitted', 'Approved', 'Rejected'],
      default: 'Draft',
    },
  },
  { timestamps: true }
);

appraisalSchema.index({ faculty: 1, academicYear: 1 }, { unique: true });

export const Appraisal = mongoose.model('Appraisal', appraisalSchema);
