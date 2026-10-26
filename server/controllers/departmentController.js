import { Department } from '../models/Department.js';
import { User } from '../models/User.js';

export const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find()
      .populate('hod', 'name email employeeId avatarUrl')
      .sort({ name: 1 });
    res.status(200).json({ success: true, count: departments.length, departments });
  } catch (error) {
    next(error);
  }
};

export const getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id).populate('hod', 'name email employeeId');
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }
    res.status(200).json({ success: true, department });
  } catch (error) {
    next(error);
  }
};

export const createDepartment = async (req, res, next) => {
  try {
    const { name, code, hod, description } = req.body;
    const department = await Department.create({ name, code, hod: hod || null, description });
    res.status(201).json({ success: true, department });
  } catch (error) {
    next(error);
  }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('hod', 'name email');

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    // If HoD was updated, update user's role and department
    if (req.body.hod) {
      await User.findByIdAndUpdate(req.body.hod, { role: 'hod', department: department._id });
    }

    res.status(200).json({ success: true, department });
  } catch (error) {
    next(error);
  }
};

export const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }
    res.status(200).json({ success: true, message: 'Department deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
