import mongoose from 'mongoose';

const academicYearSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: [true, 'Academic year label is required (e.g. 2025-26)'],
      unique: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isCurrent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Ensure only one year is current if set to true
academicYearSchema.pre('save', async function (next) {
  if (this.isCurrent) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { $set: { isCurrent: false } }
    );
  }
  next();
});

export const AcademicYear = mongoose.model('AcademicYear', academicYearSchema);
