import { TeachingWorkload } from '../models/TeachingWorkload.js';
import { Publication } from '../models/Publication.js';
import { FDP } from '../models/FDP.js';
import { Consultancy } from '../models/Consultancy.js';
import { Patent } from '../models/Patent.js';
import { Appraisal } from '../models/Appraisal.js';
import { User } from '../models/User.js';
import { AuditLog } from '../models/AuditLog.js';
import { clearScoreCache } from '../services/scoring.js';

const modelMap = {
  teaching: TeachingWorkload,
  publications: Publication,
  fdps: FDP,
  consultancy: Consultancy,
  patents: Patent,
  appraisals: Appraisal,
};

const getModel = (moduleName) => {
  const model = modelMap[moduleName.toLowerCase()];
  if (!model) throw new Error(`Unknown activity module: ${moduleName}`);
  return model;
};

// Generic list query with filtering, search, pagination, and role scoping
export const listRecords = async (req, res, next) => {
  try {
    const { module } = req.params;
    const Model = getModel(module);

    const {
      faculty,
      department,
      academicYear,
      status,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = {};

    // Academic Year filter
    if (academicYear) {
      query.academicYear = academicYear;
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // Role-based visibility scoping
    if (req.user.role === 'faculty') {
      query.faculty = req.user._id;
    } else if (req.user.role === 'hod') {
      if (faculty) {
        query.faculty = faculty;
      } else {
        // Find all faculty in this HoD's department
        const deptFaculty = await User.find({
          department: req.user.department?._id || req.user.department,
        }).select('_id');
        query.faculty = { $in: deptFaculty.map((f) => f._id) };
      }
    } else if (req.user.role === 'admin') {
      if (faculty) {
        query.faculty = faculty;
      } else if (department) {
        const deptFaculty = await User.find({ department }).select('_id');
        query.faculty = { $in: deptFaculty.map((f) => f._id) };
      }
    }

    // Search filter across relevant text fields
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      if (module === 'publications') {
        query.$or = [{ title: searchRegex }, { venueName: searchRegex }, { doi: searchRegex }];
      } else if (module === 'teaching') {
        query.$or = [{ courseCode: searchRegex }, { courseName: searchRegex }, { program: searchRegex }];
      } else if (module === 'fdps') {
        query.$or = [{ title: searchRegex }, { organizer: searchRegex }];
      } else if (module === 'consultancy') {
        query.$or = [{ projectTitle: searchRegex }, { clientOrganization: searchRegex }];
      } else if (module === 'patents') {
        query.$or = [{ title: searchRegex }, { applicationNumber: searchRegex }];
      }
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Model.countDocuments(query);
    const records = await Model.find(query)
      .populate('faculty', 'name email employeeId designation department')
      .populate('academicYear', 'label isCurrent')
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      records,
    });
  } catch (error) {
    next(error);
  }
};

import { AcademicYear } from '../models/AcademicYear.js';

// Create a record (Draft status by default)
export const createRecord = async (req, res, next) => {
  try {
    const { module } = req.params;
    const Model = getModel(module);

    // Default faculty to current logged in user if faculty role
    const facultyId = req.user.role === 'faculty' ? req.user._id : req.body.faculty || req.user._id;

    // Resolve academic year if not specified
    let yearId = req.body.academicYear;
    if (!yearId) {
      const currentYear = await AcademicYear.findOne({ isCurrent: true }) || await AcademicYear.findOne().sort({ startDate: -1 });
      yearId = currentYear?._id;
    }

    const record = await Model.create({
      ...req.body,
      faculty: facultyId,
      academicYear: yearId,
      status: 'Draft',
    });

    await AuditLog.create({
      user: req.user._id,
      action: 'CREATE',
      entity: module,
      entityId: record._id,
    });

    const populated = await Model.findById(record._id)
      .populate('faculty', 'name email employeeId')
      .populate('academicYear', 'label');

    res.status(201).json({ success: true, record: populated });
  } catch (error) {
    next(error);
  }
};

// Update record (faculty can update Draft or Rejected)
export const updateRecord = async (req, res, next) => {
  try {
    const { module, id } = req.params;
    const Model = getModel(module);

    const record = await Model.findById(id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found.' });
    }

    // Permission check
    if (req.user.role === 'faculty') {
      if (record.faculty.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'You can only edit your own records.' });
      }
      if (record.status !== 'Draft' && record.status !== 'Rejected') {
        return res.status(400).json({
          success: false,
          message: `Cannot edit record in '${record.status}' status. Only Draft or Rejected records can be modified.`,
        });
      }
    }

    // Apply updates
    const updated = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('faculty', 'name email employeeId')
      .populate('academicYear', 'label');

    await AuditLog.create({
      user: req.user._id,
      action: 'UPDATE',
      entity: module,
      entityId: record._id,
    });

    res.status(200).json({ success: true, record: updated });
  } catch (error) {
    next(error);
  }
};

// Delete record (Draft only for faculty)
export const deleteRecord = async (req, res, next) => {
  try {
    const { module, id } = req.params;
    const Model = getModel(module);

    const record = await Model.findById(id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found.' });
    }

    if (req.user.role === 'faculty') {
      if (record.faculty.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'You can only delete your own records.' });
      }
      if (record.status !== 'Draft') {
        return res.status(400).json({ success: false, message: 'Only Draft records can be deleted.' });
      }
    }

    await Model.findByIdAndDelete(id);

    await AuditLog.create({
      user: req.user._id,
      action: 'DELETE',
      entity: module,
      entityId: record._id,
    });

    clearScoreCache(record.faculty);

    res.status(200).json({ success: true, message: 'Record deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// Submit record for HoD approval (Draft/Rejected -> Submitted)
export const submitRecord = async (req, res, next) => {
  try {
    const { module, id } = req.params;
    const Model = getModel(module);

    const record = await Model.findById(id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found.' });
    }

    if (req.user.role === 'faculty' && record.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only submit your own records.' });
    }

    record.status = 'Submitted';
    record.remarks = req.body.remarks || record.remarks || '';
    await record.save();

    await AuditLog.create({
      user: req.user._id,
      action: 'SUBMIT',
      entity: module,
      entityId: record._id,
      meta: { remarks: record.remarks },
    });

    res.status(200).json({
      success: true,
      message: 'Record submitted for approval.',
      record,
    });
  } catch (error) {
    next(error);
  }
};

// Approve record (Submitted -> Approved)
export const approveRecord = async (req, res, next) => {
  try {
    const { module, id } = req.params;
    const Model = getModel(module);

    const record = await Model.findById(id).populate('faculty');
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found.' });
    }

    // HoD can only approve for faculty in their own department
    if (req.user.role === 'hod') {
      const facultyDept = record.faculty?.department?.toString();
      const hodDept = req.user.department?._id?.toString() || req.user.department?.toString();
      if (facultyDept !== hodDept) {
        return res.status(403).json({
          success: false,
          message: 'You can only approve records for faculty in your own department.',
        });
      }
    }

    record.status = 'Approved';
    record.remarks = req.body.remarks || 'Approved by HoD';
    await record.save();

    await AuditLog.create({
      user: req.user._id,
      action: 'APPROVE',
      entity: module,
      entityId: record._id,
      meta: { remarks: record.remarks },
    });

    // Clear score cache so recalculations reflect immediate approval
    clearScoreCache(record.faculty._id);

    res.status(200).json({
      success: true,
      message: 'Record approved successfully.',
      record,
    });
  } catch (error) {
    next(error);
  }
};

// Reject record (Submitted -> Rejected with remarks)
export const rejectRecord = async (req, res, next) => {
  try {
    const { module, id } = req.params;
    const Model = getModel(module);

    const record = await Model.findById(id).populate('faculty');
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found.' });
    }

    if (req.user.role === 'hod') {
      const facultyDept = record.faculty?.department?.toString();
      const hodDept = req.user.department?._id?.toString() || req.user.department?.toString();
      if (facultyDept !== hodDept) {
        return res.status(403).json({
          success: false,
          message: 'You can only reject records for faculty in your own department.',
        });
      }
    }

    record.status = 'Rejected';
    record.remarks = req.body.remarks || 'Rejected: documentation clarification required.';
    await record.save();

    await AuditLog.create({
      user: req.user._id,
      action: 'REJECT',
      entity: module,
      entityId: record._id,
      meta: { remarks: record.remarks },
    });

    clearScoreCache(record.faculty._id);

    res.status(200).json({
      success: true,
      message: 'Record rejected.',
      record,
    });
  } catch (error) {
    next(error);
  }
};
