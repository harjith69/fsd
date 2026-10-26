import { User } from '../models/User.js';
import { Department } from '../models/Department.js';
import { AcademicYear } from '../models/AcademicYear.js';
import { Publication } from '../models/Publication.js';
import { TeachingWorkload } from '../models/TeachingWorkload.js';
import { FDP } from '../models/FDP.js';
import { Consultancy } from '../models/Consultancy.js';
import { Patent } from '../models/Patent.js';
import { calculateFacultyScore, getFacultyDepartmentRank, getFacultyYoYTrend } from '../services/scoring.js';

// Faculty Analytics
export const getFacultyAnalytics = async (req, res, next) => {
  try {
    const facultyId = req.params.id;
    const { year } = req.query;

    const faculty = await User.findById(facultyId).populate('department');
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty not found.' });
    }

    // Resolve academic year: provided id, or current year, or latest year
    let academicYear = null;
    if (year) {
      academicYear = await AcademicYear.findById(year);
    }
    if (!academicYear) {
      academicYear = await AcademicYear.findOne({ isCurrent: true }) || (await AcademicYear.findOne().sort({ startDate: -1 }));
    }

    if (!academicYear) {
      return res.status(400).json({ success: false, message: 'No academic years configured.' });
    }

    // 1. Calculate Score & Category Breakdown
    const scoreData = await calculateFacultyScore(faculty._id, academicYear._id);

    // 2. Department Rank
    const rankData = await getFacultyDepartmentRank(
      faculty._id,
      academicYear._id,
      faculty.department?._id || faculty.department
    );

    // 3. Year-over-Year Trends
    const yoyTrends = await getFacultyYoYTrend(faculty._id);

    // 4. Publication Breakdown (by type & indexing)
    const publications = await Publication.find({ faculty: faculty._id, academicYear: academicYear._id });
    const pubTypes = { Journal: 0, Conference: 0, 'Book Chapter': 0, Book: 0 };
    const pubIndexing = { Scopus: 0, SCI: 0, WoS: 0, UGC: 0, Other: 0 };

    publications.forEach((p) => {
      if (pubTypes[p.type] !== undefined) pubTypes[p.type]++;
      if (pubIndexing[p.indexing] !== undefined) pubIndexing[p.indexing]++;
    });

    const pubTypeDistribution = Object.entries(pubTypes).map(([name, value]) => ({ name, value }));
    const pubIndexingDistribution = Object.entries(pubIndexing).map(([name, value]) => ({ name, value }));

    // 5. Pending approvals count
    const [pendingTeach, pendingPub, pendingFdp, pendingCons, pendingPat] = await Promise.all([
      TeachingWorkload.countDocuments({ faculty: faculty._id, academicYear: academicYear._id, status: 'Submitted' }),
      Publication.countDocuments({ faculty: faculty._id, academicYear: academicYear._id, status: 'Submitted' }),
      FDP.countDocuments({ faculty: faculty._id, academicYear: academicYear._id, status: 'Submitted' }),
      Consultancy.countDocuments({ faculty: faculty._id, academicYear: academicYear._id, status: 'Submitted' }),
      Patent.countDocuments({ faculty: faculty._id, academicYear: academicYear._id, status: 'Submitted' }),
    ]);

    const pendingApprovalsCount = pendingTeach + pendingPub + pendingFdp + pendingCons + pendingPat;

    // 6. Recent activity timeline (across all modules)
    const [recentTeach, recentPub, recentFdp, recentCons, recentPat] = await Promise.all([
      TeachingWorkload.find({ faculty: faculty._id }).sort({ updatedAt: -1 }).limit(3).lean(),
      Publication.find({ faculty: faculty._id }).sort({ updatedAt: -1 }).limit(3).lean(),
      FDP.find({ faculty: faculty._id }).sort({ updatedAt: -1 }).limit(3).lean(),
      Consultancy.find({ faculty: faculty._id }).sort({ updatedAt: -1 }).limit(3).lean(),
      Patent.find({ faculty: faculty._id }).sort({ updatedAt: -1 }).limit(3).lean(),
    ]);

    const timeline = [
      ...recentTeach.map((r) => ({ ...r, module: 'Teaching', title: `${r.courseCode} - ${r.courseName}` })),
      ...recentPub.map((r) => ({ ...r, module: 'Publication', title: r.title })),
      ...recentFdp.map((r) => ({ ...r, module: 'FDP', title: r.title })),
      ...recentCons.map((r) => ({ ...r, module: 'Consultancy', title: r.projectTitle })),
      ...recentPat.map((r) => ({ ...r, module: 'Patent', title: r.title })),
    ]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 7);

    res.status(200).json({
      success: true,
      faculty: {
        id: faculty._id,
        name: faculty.name,
        email: faculty.email,
        employeeId: faculty.employeeId,
        designation: faculty.designation,
        department: faculty.department,
        avatarUrl: faculty.avatarUrl,
      },
      academicYear: {
        id: academicYear._id,
        label: academicYear.label,
        isCurrent: academicYear.isCurrent,
      },
      score: scoreData,
      rank: rankData,
      yoyTrends,
      pubTypeDistribution,
      pubIndexingDistribution,
      pendingApprovalsCount,
      timeline,
    });
  } catch (error) {
    next(error);
  }
};

// Department Analytics & Leaderboard
export const getDepartmentAnalytics = async (req, res, next) => {
  try {
    const departmentId = req.params.id;
    const { year } = req.query;

    const department = await Department.findById(departmentId).populate('hod', 'name email');
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    let academicYear = null;
    if (year) {
      academicYear = await AcademicYear.findById(year);
    }
    if (!academicYear) {
      academicYear = (await AcademicYear.findOne({ isCurrent: true })) || (await AcademicYear.findOne().sort({ startDate: -1 }));
    }

    const facultyMembers = await User.find({
      department: department._id,
      role: 'faculty',
      isActive: true,
    }).select('name email employeeId designation avatarUrl');

    // Compute scores for each faculty member
    const leaderboard = await Promise.all(
      facultyMembers.map(async (faculty) => {
        const scoreData = await calculateFacultyScore(faculty._id, academicYear._id);
        return {
          faculty,
          score: scoreData,
          performanceIndex: scoreData.performanceIndex,
          grade: scoreData.grade,
        };
      })
    );

    // Sort leaderboard by score descending
    leaderboard.sort((a, b) => b.performanceIndex - a.performanceIndex);

    // Aggregates
    const facultyIds = facultyMembers.map((f) => f._id);
    const [approvedPubs, approvedFdp, approvedCons, approvedPat, pendingCount] = await Promise.all([
      Publication.find({ faculty: { $in: facultyIds }, academicYear: academicYear._id, status: 'Approved' }),
      FDP.find({ faculty: { $in: facultyIds }, academicYear: academicYear._id, status: 'Approved' }),
      Consultancy.find({ faculty: { $in: facultyIds }, academicYear: academicYear._id, status: 'Approved' }),
      Patent.find({ faculty: { $in: facultyIds }, academicYear: academicYear._id, status: 'Approved' }),
      // Total pending approval items for HoD
      Promise.all([
        TeachingWorkload.countDocuments({ faculty: { $in: facultyIds }, academicYear: academicYear._id, status: 'Submitted' }),
        Publication.countDocuments({ faculty: { $in: facultyIds }, academicYear: academicYear._id, status: 'Submitted' }),
        FDP.countDocuments({ faculty: { $in: facultyIds }, academicYear: academicYear._id, status: 'Submitted' }),
        Consultancy.countDocuments({ faculty: { $in: facultyIds }, academicYear: academicYear._id, status: 'Submitted' }),
        Patent.countDocuments({ faculty: { $in: facultyIds }, academicYear: academicYear._id, status: 'Submitted' }),
      ]).then((arr) => arr.reduce((a, b) => a + b, 0)),
    ]);

    const totalConsultancyEarned = approvedCons.reduce((acc, curr) => acc + (curr.amountEarned || 0), 0);
    const avgScore =
      leaderboard.length > 0
        ? Number((leaderboard.reduce((acc, curr) => acc + curr.performanceIndex, 0) / leaderboard.length).toFixed(1))
        : 0;

    res.status(200).json({
      success: true,
      department,
      academicYear,
      kpis: {
        totalFaculty: facultyMembers.length,
        averagePerformanceIndex: avgScore,
        totalPublications: approvedPubs.length,
        totalFdpAttendedOrganized: approvedFdp.length,
        totalConsultancyINR: totalConsultancyEarned,
        totalPatents: approvedPat.length,
        pendingApprovals: pendingCount,
      },
      leaderboard,
    });
  } catch (error) {
    next(error);
  }
};

// Institution-wide Analytics
export const getInstitutionAnalytics = async (req, res, next) => {
  try {
    const { year } = req.query;

    let academicYear = null;
    if (year) {
      academicYear = await AcademicYear.findById(year);
    }
    if (!academicYear) {
      academicYear = (await AcademicYear.findOne({ isCurrent: true })) || (await AcademicYear.findOne().sort({ startDate: -1 }));
    }

    const departments = await Department.find();
    const departmentStats = [];

    let totalInstPubs = 0;
    let totalInstConsultancy = 0;
    let totalInstPatents = 0;
    let totalInstFaculty = 0;
    let totalScoreSum = 0;

    for (const dept of departments) {
      const deptFaculty = await User.find({ department: dept._id, role: 'faculty', isActive: true });
      const fIds = deptFaculty.map((f) => f._id);

      const [pubs, cons, patents] = await Promise.all([
        Publication.countDocuments({ faculty: { $in: fIds }, academicYear: academicYear._id, status: 'Approved' }),
        Consultancy.find({ faculty: { $in: fIds }, academicYear: academicYear._id, status: 'Approved' }),
        Patent.countDocuments({ faculty: { $in: fIds }, academicYear: academicYear._id, status: 'Approved' }),
      ]);

      const consultSum = cons.reduce((sum, c) => sum + (c.amountEarned || 0), 0);

      // Average score
      let deptScoreSum = 0;
      for (const f of deptFaculty) {
        const s = await calculateFacultyScore(f._id, academicYear._id);
        deptScoreSum += s.performanceIndex;
      }
      const avgDeptScore = deptFaculty.length > 0 ? Number((deptScoreSum / deptFaculty.length).toFixed(1)) : 0;

      totalInstPubs += pubs;
      totalInstConsultancy += consultSum;
      totalInstPatents += patents;
      totalInstFaculty += deptFaculty.length;
      totalScoreSum += deptScoreSum;

      departmentStats.push({
        id: dept._id,
        name: dept.name,
        code: dept.code,
        facultyCount: deptFaculty.length,
        averageIndex: avgDeptScore,
        publications: pubs,
        consultancyAmount: consultSum,
        patents,
      });
    }

    const institutionAvgScore =
      totalInstFaculty > 0 ? Number((totalScoreSum / totalInstFaculty).toFixed(1)) : 0;

    res.status(200).json({
      success: true,
      academicYear,
      kpis: {
        totalFaculty: totalInstFaculty,
        totalDepartments: departments.length,
        averagePerformanceIndex: institutionAvgScore,
        totalPublications: totalInstPubs,
        totalConsultancyINR: totalInstConsultancy,
        totalPatents: totalInstPatents,
      },
      departments: departmentStats,
    });
  } catch (error) {
    next(error);
  }
};
