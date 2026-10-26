import mongoose from 'mongoose';

const publicationSchema = new mongoose.Schema(
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
      required: [true, 'Publication title is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['Journal', 'Conference', 'Book Chapter', 'Book'],
      default: 'Journal',
    },
    venueName: {
      type: String,
      required: [true, 'Journal/Conference venue name is required'],
      trim: true,
    },
    indexing: {
      type: String,
      enum: ['Scopus', 'SCI', 'WoS', 'UGC', 'Other'],
      default: 'Scopus',
    },
    publishedDate: {
      type: Date,
      default: () => new Date(),
    },
    doi: {
      type: String,
      trim: true,
      default: '',
    },
    issnIsbn: {
      type: String,
      trim: true,
      default: '',
    },
    coAuthors: {
      type: [String],
      default: [],
    },
    impactFactor: {
      type: Number,
      default: 0,
      min: 0,
    },
    citations: {
      type: Number,
      default: 0,
      min: 0,
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

publicationSchema.index({ faculty: 1, academicYear: 1 });
publicationSchema.index({ title: 'text', venueName: 'text' });

export const Publication = mongoose.model('Publication', publicationSchema);
