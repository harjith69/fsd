import { User } from '../models/User.js';
import { Department } from '../models/Department.js';
import { AcademicYear } from '../models/AcademicYear.js';
import { Publication } from '../models/Publication.js';
import { TeachingWorkload } from '../models/TeachingWorkload.js';
import { FDP } from '../models/FDP.js';
import { Consultancy } from '../models/Consultancy.js';
import { Patent } from '../models/Patent.js';
import { calculateFacultyScore } from '../services/scoring.js';
import { generateFacultyPdf, generateFacultyExcel, generateDepartmentExcel } from '../services/reports.js';

export const getFacultyReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { year, format = 'pdf' } = req.query;

    const faculty = await User.findById(id).populate('department');
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty not found.' });
    }

    // Role check: Faculty can only export own report; HoD can export for faculty in own department; Admin can export all
    if (req.user.role === 'faculty' && req.user._id.toString() !== faculty._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only export your own report.' });
    }
    if (req.user.role === 'hod') {
      const hodDept = req.user.department?._id?.toString() || req.user.department?.toString();
      const facDept = faculty.department?._id?.toString() || faculty.department?.toString();
      if (hodDept !== facDept) {
        return res.status(403).json({ success: false, message: 'Faculty is not in your department.' });
      }
    }

    let academicYear = null;
    if (year) {
      academicYear = await AcademicYear.findById(year);
    }
    if (!academicYear) {
      academicYear = (await AcademicYear.findOne({ isCurrent: true })) || (await AcademicYear.findOne().sort({ startDate: -1 }));
    }

    const query = { faculty: faculty._id, status: 'Approved' };
    if (academicYear) query.academicYear = academicYear._id;

    const [teaching, publications, fdp, consultancy, patents] = await Promise.all([
      TeachingWorkload.find(query),
      Publication.find(query),
      FDP.find(query),
      Consultancy.find(query),
      Patent.find(query),
    ]);

    const records = { teaching, publications, fdp, consultancy, patents };
    const scoreData = academicYear ? await calculateFacultyScore(faculty._id, academicYear._id) : null;

    const filename = `Report_${faculty.name.replace(/\s+/g, '_')}_${academicYear?.label || 'All'}`;

    if (format.toLowerCase() === 'pdf') {
      const pdfBuffer = await generateFacultyPdf(faculty, academicYear, records, scoreData);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
      return res.send(pdfBuffer);
    } else {
      const excelBuffer = await generateFacultyExcel(faculty, academicYear, records, scoreData);
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
      return res.send(excelBuffer);
    }
  } catch (error) {
    next(error);
  }
};

export const getDepartmentReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { year } = req.query;

    const department = await Department.findById(id);
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

    const facultyList = await User.find({ department: department._id, role: 'faculty', isActive: true });
    const facultyScores = await Promise.all(
      facultyList.map(async (f) => {
        const score = await calculateFacultyScore(f._id, academicYear._id);
        return { faculty: f, score };
      })
    );

    facultyScores.sort((a, b) => b.score.performanceIndex - a.score.performanceIndex);

    const filename = `DeptReport_${department.code}_${academicYear?.label || 'All'}.xlsx`;
    const excelBuffer = await generateDepartmentExcel(department, academicYear, facultyScores);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(excelBuffer);
  } catch (error) {
    next(error);
  }
};
