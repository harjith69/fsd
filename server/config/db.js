import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryServerInstance = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/faculty_dashboard';

  try {
    // Attempt standard connection with 3s timeout
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.warn(`[Database] Could not connect to MongoDB at "${uri}". Falling back to MongoMemoryServer for standalone zero-config execution...`);
    
    try {
      memoryServerInstance = await MongoMemoryServer.create();
      const memoryUri = memoryServerInstance.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[Database] In-memory MongoDB running successfully at ${memoryUri}`);
      return conn;
    } catch (memErr) {
      console.error('[Database] Failed to initialize in-memory database:', memErr.message);
      process.exit(1);
    }
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServerInstance) {
    await memoryServerInstance.stop();
  }
};
