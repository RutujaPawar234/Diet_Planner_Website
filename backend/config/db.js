import mongoose from 'mongoose';
import { env } from './env.js';

mongoose.set('strictQuery', true);

/** Opens the MongoDB connection used by every Mongoose model. */
export async function connectDB(uri = env.mongoUri) {
  const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  if (!env.isTest) {
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  }
  return conn;
}

export async function disconnectDB() {
  await mongoose.connection.close();
}
