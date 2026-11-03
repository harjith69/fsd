import app from './server/server.js';
import { connectDB } from './server/config/db.js';

// Pre-warm database connection for serverless runtime
connectDB().catch((err) => {
  console.error('[Database] Connection notice:', err.message);
});

export default app;
