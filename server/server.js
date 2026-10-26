import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { protect } from './middleware/auth.js';
import { upload } from './middleware/upload.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import academicYearRoutes from './routes/academicYearRoutes.js';
import genericActivityRoutes, { createModuleRouter } from './routes/activityRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import scoringRoutes from './routes/scoringRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Dev-friendly permissive
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize inputs to prevent NoSQL query injection
app.use(mongoSanitize());

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Generous limit for dashboard usage
  message: { success: false, message: 'Too many requests from this IP, please try again later.' },
});
app.use('/api', limiter);

// Static uploads serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Proof Upload API
app.post('/api/upload', protect, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file was uploaded.' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.status(200).json({
    success: true,
    fileUrl,
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/academic-years', academicYearRoutes);

// Activity modules
app.use('/api/teaching', createModuleRouter('teaching'));
app.use('/api/publications', createModuleRouter('publications'));
app.use('/api/fdps', createModuleRouter('fdps'));
app.use('/api/consultancy', createModuleRouter('consultancy'));
app.use('/api/patents', createModuleRouter('patents'));
app.use('/api/activities', genericActivityRoutes);

// Analytics, Scoring & Reports
app.use('/api/analytics', analyticsRoutes);
app.use('/api/scoring-config', scoringRoutes);
app.use('/api/reports', reportRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});

// 404 & Centralized Error Handler
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

import { User } from './models/User.js';
import { runSeed } from './seed/seed.js';

// Connect DB & start listening
const startServer = async () => {
  await connectDB();

  // Check if database is empty and auto-seed demo data
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    console.log('[Server] Database is empty. Seeding initial demo data...');
    await runSeed(false);
  }

  app.listen(PORT, () => {
    console.log(`[Server] Faculty Performance Dashboard API running on http://localhost:${PORT}`);
  });
};

startServer();

export default app;
