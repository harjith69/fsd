import { AcademicYear } from '../models/AcademicYear.js';

export const getAcademicYears = async (req, res, next) => {
  try {
    const years = await AcademicYear.find().sort({ startDate: -1 });
    res.status(200).json({ success: true, count: years.length, years });
  } catch (error) {
    next(error);
  }
};

export const getCurrentAcademicYear = async (req, res, next) => {
  try {
    let current = await AcademicYear.findOne({ isCurrent: true });
    if (!current) {
      current = await AcademicYear.findOne().sort({ startDate: -1 });
    }
    res.status(200).json({ success: true, academicYear: current });
  } catch (error) {
    next(error);
  }
};

export const createAcademicYear = async (req, res, next) => {
  try {
    const { label, startDate, endDate, isCurrent } = req.body;
    const year = await AcademicYear.create({ label, startDate, endDate, isCurrent });
    res.status(201).json({ success: true, academicYear: year });
  } catch (error) {
    next(error);
  }
};

export const updateAcademicYear = async (req, res, next) => {
  try {
    const year = await AcademicYear.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!year) {
      return res.status(404).json({ success: false, message: 'Academic Year not found.' });
    }
    res.status(200).json({ success: true, academicYear: year });
  } catch (error) {
    next(error);
  }
};

export const deleteAcademicYear = async (req, res, next) => {
  try {
    const year = await AcademicYear.findByIdAndDelete(req.params.id);
    if (!year) {
      return res.status(404).json({ success: false, message: 'Academic Year not found.' });
    }
    res.status(200).json({ success: true, message: 'Academic Year deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
