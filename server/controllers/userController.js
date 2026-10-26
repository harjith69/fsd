import { User } from '../models/User.js';

export const getUsers = async (req, res, next) => {
  try {
    const { department, role, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (department) filter.department = department;
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }

    // HoD can only view users in their own department
    if (req.user.role === 'hod' && req.user.department) {
      filter.department = req.user.department._id || req.user.department;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-passwordHash')
      .populate('department', 'name code')
      .sort({ name: 1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      users,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash').populate('department');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department, employeeId, designation, qualification, phone } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists.' });
    }

    const passwordHash = await User.hashPassword(password || 'Welcome@123');
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role || 'faculty',
      department: department || null,
      employeeId,
      designation,
      qualification,
      phone,
    });

    const userObj = user.toObject();
    delete userObj.passwordHash;

    res.status(201).json({ success: true, user: userObj });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    delete updates.passwordHash; // Don't allow direct password hash edit here

    if (updates.password) {
      updates.passwordHash = await User.hashPassword(updates.password);
      delete updates.password;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
      .select('-passwordHash')
      .populate('department');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.status(200).json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
