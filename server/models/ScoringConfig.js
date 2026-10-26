import mongoose from 'mongoose';

const scoringConfigSchema = new mongoose.Schema(
  {
    isActive: {
      type: Boolean,
      default: true,
    },
    weights: {
      teaching: { type: Number, default: 30 },
      publications: { type: Number, default: 25 },
      fdp: { type: Number, default: 10 },
      consultancy: { type: Number, default: 15 },
      patents: { type: Number, default: 10 },
      feedback: { type: Number, default: 10 },
    },
    targets: {
      teachingHours: { type: Number, default: 120 }, // benchmark delivered hours
      publicationPoints: { type: Number, default: 30 }, // benchmark publication pts
      fdpPoints: { type: Number, default: 20 },
      consultancyAmount: { type: Number, default: 100000 }, // benchmark INR
      patentPoints: { type: Number, default: 15 },
      feedbackScore: { type: Number, default: 5 }, // max score
    },
    pointsRules: {
      publications: {
        journalScopus: { type: Number, default: 10 },
        journalSCI: { type: Number, default: 15 },
        journalWoS: { type: Number, default: 12 },
        journalUGC: { type: Number, default: 5 },
        journalOther: { type: Number, default: 3 },
        conference: { type: Number, default: 5 },
        bookChapter: { type: Number, default: 6 },
        book: { type: Number, default: 12 },
      },
      fdp: {
        organized: { type: Number, default: 8 },
        resourcePerson: { type: Number, default: 6 },
        attended: { type: Number, default: 3 },
      },
      patents: {
        granted: { type: Number, default: 15 },
        published: { type: Number, default: 8 },
        filed: { type: Number, default: 4 },
      },
      consultancy: {
        piBasePoints: { type: Number, default: 10 },
        coPiBasePoints: { type: Number, default: 5 },
        pointsPer25k: { type: Number, default: 2 },
      },
      teaching: {
        theoryMultiplier: { type: Number, default: 1.0 },
        labMultiplier: { type: Number, default: 0.75 },
        tutorialMultiplier: { type: Number, default: 0.5 },
        projectMultiplier: { type: Number, default: 1.2 },
      },
    },
  },
  { timestamps: true }
);

export const ScoringConfig = mongoose.model('ScoringConfig', scoringConfigSchema);
