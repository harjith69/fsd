import mongoose from 'mongoose';

const patentSchema = new mongoose.Schema(
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
      required: [true, 'Patent title is required'],
      trim: true,
    },
    applicationNumber: {
      type: String,
      required: [true, 'Application or registration number is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['Filed', 'Published', 'Granted'],
      default: 'Filed',
    },
    filingDate: {
      type: Date,
      required: true,
    },
    grantDate: {
      type: Date,
      default: null,
    },
    coInventors: {
      type: [String],
      default: [],
    },
    country: {
      type: String,
      default: 'India',
      trim: true,
    },
    proofUrl: {
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

patentSchema.index({ faculty: 1, academicYear: 1 });

export const Patent = mongoose.model('Patent', patentSchema);
