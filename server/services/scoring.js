import { ScoringConfig } from '../models/ScoringConfig.js';
import { TeachingWorkload } from '../models/TeachingWorkload.js';
import { Publication } from '../models/Publication.js';
import { FDP } from '../models/FDP.js';
import { Consultancy } from '../models/Consultancy.js';
import { Patent } from '../models/Patent.js';
import { User } from '../models/User.js';
import { AcademicYear } from '../models/AcademicYear.js';

// In-memory cache for computed scores: key = `${facultyId}-${yearId}`
const scoreCache = new Map();

export const clearScoreCache = (facultyId = null) => {
  if (facultyId) {
    for (const key of scoreCache.keys()) {
      if (key.startsWith(facultyId.toString())) {
        scoreCache.delete(key);
      }
    }
  } else {
    scoreCache.clear();
  }
};

export const getOrInitScoringConfig = async () => {
  let config = await ScoringConfig.findOne({ isActive: true });
  if (!config) {
    config = await ScoringConfig.create({
      isActive: true,
      weights: {
        teaching: 30,
        publications: 25,
        fdp: 10,
        consultancy: 15,
        patents: 10,
        feedback: 10,
      },
      targets: {
        teachingHours: 120,
        publicationPoints: 30,
        fdpPoints: 20,
        consultancyAmount: 100000,
        patentPoints: 15,
        feedbackScore: 5,
      },
    });
  }
  return config;
};

/**
 * Calculates raw points, normalized scores (0-100), and weighted total for a faculty in an academic year
 */
export const calculateFacultyScore = async (facultyId, academicYearId, skipCache = false) => {
  const cacheKey = `${facultyId}-${academicYearId}`;
  if (!skipCache && scoreCache.has(cacheKey)) {
    return scoreCache.get(cacheKey);
  }

  const config = await getOrInitScoringConfig();
  const { weights, targets, pointsRules } = config;

  // Query only APPROVED records for scoring
  const query = { faculty: facultyId, academicYear: academicYearId, status: 'Approved' };

  const [teachingRecords, pubRecords, fdpRecords, consultRecords, patentRecords] = await Promise.all([
    TeachingWorkload.find(query),
    Publication.find(query),
    FDP.find(query),
    Consultancy.find(query),
    Patent.find(query),
  ]);

  // 1. Teaching Points & Feedback Score
  let totalDeliveredHours = 0;
  let teachingPoints = 0;
  let totalFeedback = 0;
  let feedbackCount = 0;

  for (const t of teachingRecords) {
    totalDeliveredHours += t.totalHoursDelivered || 0;
    const mult =
      t.type === 'Lab'
        ? pointsRules.teaching.labMultiplier
        : t.type === 'Tutorial'
        ? pointsRules.teaching.tutorialMultiplier
        : t.type === 'Project'
        ? pointsRules.teaching.projectMultiplier
        : pointsRules.teaching.theoryMultiplier;
    teachingPoints += (t.totalHoursDelivered || 0) * (mult || 1);

    if (t.feedbackScore) {
      totalFeedback += t.feedbackScore;
      feedbackCount += 1;
    }
  }

  const avgFeedbackScore = feedbackCount > 0 ? Number((totalFeedback / feedbackCount).toFixed(2)) : 4.0;

  // 2. Publication Points
  let pubPoints = 0;
  for (const p of pubRecords) {
    if (p.type === 'Journal') {
      if (p.indexing === 'SCI') pubPoints += pointsRules.publications.journalSCI;
      else if (p.indexing === 'Scopus') pubPoints += pointsRules.publications.journalScopus;
      else if (p.indexing === 'WoS') pubPoints += pointsRules.publications.journalWoS;
      else if (p.indexing === 'UGC') pubPoints += pointsRules.publications.journalUGC;
      else pubPoints += pointsRules.publications.journalOther;
    } else if (p.type === 'Conference') {
      pubPoints += pointsRules.publications.conference;
    } else if (p.type === 'Book Chapter') {
      pubPoints += pointsRules.publications.bookChapter;
    } else if (p.type === 'Book') {
      pubPoints += pointsRules.publications.book;
    }
  }

  // 3. FDP Points
  let fdpPoints = 0;
  for (const f of fdpRecords) {
    if (f.role === 'Organized') fdpPoints += pointsRules.fdp.organized;
    else if (f.role === 'Resource Person') fdpPoints += pointsRules.fdp.resourcePerson;
    else fdpPoints += pointsRules.fdp.attended;
  }

  // 4. Consultancy Points
  let consultAmount = 0;
  let consultPoints = 0;
  for (const c of consultRecords) {
    const amt = c.amountEarned || 0;
    consultAmount += amt;
    const base = c.role === 'PI' ? pointsRules.consultancy.piBasePoints : pointsRules.consultancy.coPiBasePoints;
    const bonus = Math.floor(amt / 25000) * pointsRules.consultancy.pointsPer25k;
    consultPoints += base + bonus;
  }

  // 5. Patent Points
  let patentPoints = 0;
  for (const pat of patentRecords) {
    if (pat.type === 'Granted') patentPoints += pointsRules.patents.granted;
    else if (pat.type === 'Published') patentPoints += pointsRules.patents.published;
    else patentPoints += pointsRules.patents.filed;
  }

  // Normalization (capped at 100% per category)
  const normTeaching = Math.min(100, Math.round(((totalDeliveredHours || 0) / (targets.teachingHours || 120)) * 100));
  const normPubs = Math.min(100, Math.round(((pubPoints || 0) / (targets.publicationPoints || 30)) * 100));
  const normFdp = Math.min(100, Math.round(((fdpPoints || 0) / (targets.fdpPoints || 20)) * 100));
  const normConsult = Math.min(100, Math.round(((consultAmount || 0) / (targets.consultancyAmount || 100000)) * 100));
  const normPatents = Math.min(100, Math.round(((patentPoints || 0) / (targets.patentPoints || 15)) * 100));
  const normFeedback = Math.min(100, Math.round(((avgFeedbackScore || 0) / (targets.feedbackScore || 5)) * 100));

  // Weighted sum to compute Performance Index (0-100)
  const weightedScore =
    (normTeaching * (weights.teaching || 30) +
      normPubs * (weights.publications || 25) +
      normFdp * (weights.fdp || 10) +
      normConsult * (weights.consultancy || 15) +
      normPatents * (weights.patents || 10) +
      normFeedback * (weights.feedback || 10)) /
    100;

  const performanceIndex = Number(weightedScore.toFixed(1));

  // Determine Grade
  let grade = 'Needs Improvement';
  if (performanceIndex >= 85) grade = 'Outstanding';
  else if (performanceIndex >= 70) grade = 'Very Good';
  else if (performanceIndex >= 55) grade = 'Good';

  const result = {
    performanceIndex,
    grade,
    categories: {
      teaching: {
        raw: totalDeliveredHours,
        target: targets.teachingHours,
        score: normTeaching,
        weight: weights.teaching,
        weightedScore: Number(((normTeaching * weights.teaching) / 100).toFixed(1)),
      },
      publications: {
        raw: pubPoints,
        count: pubRecords.length,
        target: targets.publicationPoints,
        score: normPubs,
        weight: weights.publications,
        weightedScore: Number(((normPubs * weights.publications) / 100).toFixed(1)),
      },
      fdp: {
        raw: fdpPoints,
        count: fdpRecords.length,
        target: targets.fdpPoints,
        score: normFdp,
        weight: weights.fdp,
        weightedScore: Number(((normFdp * weights.fdp) / 100).toFixed(1)),
      },
      consultancy: {
        raw: consultAmount,
        points: consultPoints,
        count: consultRecords.length,
        target: targets.consultancyAmount,
        score: normConsult,
        weight: weights.consultancy,
        weightedScore: Number(((normConsult * weights.consultancy) / 100).toFixed(1)),
      },
      patents: {
        raw: patentPoints,
        count: patentRecords.length,
        target: targets.patentPoints,
        score: normPatents,
        weight: weights.patents,
        weightedScore: Number(((normPatents * weights.patents) / 100).toFixed(1)),
      },
      feedback: {
        raw: avgFeedbackScore,
        target: targets.feedbackScore,
        score: normFeedback,
        weight: weights.feedback,
        weightedScore: Number(((normFeedback * weights.feedback) / 100).toFixed(1)),
      },
    },
    counts: {
      teaching: teachingRecords.length,
      publications: pubRecords.length,
      fdp: fdpRecords.length,
      consultancy: consultRecords.length,
      patents: patentRecords.length,
    },
    updatedAt: new Date(),
  };

  scoreCache.set(cacheKey, result);
  return result;
};

/**
 * Calculates department rank for a faculty member in a given academic year
 */
export const getFacultyDepartmentRank = async (facultyId, academicYearId, departmentId) => {
  const departmentFaculty = await User.find({ department: departmentId, role: 'faculty', isActive: true }).select('_id');
  if (!departmentFaculty.length) return { rank: 1, totalInDept: 1 };

  const scores = await Promise.all(
    departmentFaculty.map(async (f) => {
      const scoreData = await calculateFacultyScore(f._id, academicYearId);
      return { facultyId: f._id.toString(), score: scoreData.performanceIndex };
    })
  );

  scores.sort((a, b) => b.score - a.score);
  const rankIndex = scores.findIndex((s) => s.facultyId === facultyId.toString());
  return {
    rank: rankIndex !== -1 ? rankIndex + 1 : 1,
    totalInDept: departmentFaculty.length,
  };
};

/**
 * Computes year-over-year index changes for a faculty
 */
export const getFacultyYoYTrend = async (facultyId) => {
  const years = await AcademicYear.find().sort({ startDate: 1 });
  const trends = [];

  for (const year of years) {
    const scoreData = await calculateFacultyScore(facultyId, year._id);
    trends.push({
      yearId: year._id,
      yearLabel: year.label,
      performanceIndex: scoreData.performanceIndex,
      grade: scoreData.grade,
      teaching: scoreData.categories.teaching.score,
      publications: scoreData.categories.publications.score,
      fdp: scoreData.categories.fdp.score,
      consultancy: scoreData.categories.consultancy.score,
      patents: scoreData.categories.patents.score,
    });
  }

  return trends;
};
