import dns from 'node:dns';
import mongoose from 'mongoose';
import { env } from './env.js';

mongoose.set('strictQuery', true);

// Some networks refuse Node's SRV lookups for "mongodb+srv://" URIs (querySrv ECONNREFUSED).
// Optionally resolve through public DNS instead, e.g. DNS_SERVERS=8.8.8.8,1.1.1.1
if (process.env.DNS_SERVERS) {
  dns.setServers(process.env.DNS_SERVERS.split(',').map((s) => s.trim()).filter(Boolean));
}

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
