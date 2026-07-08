import mongoose from 'mongoose';

export async function connectDB(uri) {
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`[db] connected: ${uri}`);
  } catch (err) {
    console.error('[db] connection failed:', err.message);
    console.error('[db] make sure MongoDB is running on the configured URI.');
    process.exit(1);
  }
}
