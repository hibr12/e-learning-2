import mongoose from 'mongoose';

export const connectDb = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is missing. Add it to .env before starting the server.');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log(`MongoDB connected: ${mongoose.connection.name}`);
};
