import mongoose from 'mongoose';
import dotenv from "dotenv";
dotenv.config();
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error(`
⚠️  MongoDB is not running or connection string is incorrect.

Options to fix:
1. Start local MongoDB:
   - Windows: net start MongoDB (or start MongoDB Compass)
   - Mac/Linux: sudo systemctl start mongod

2. Use MongoDB Atlas (recommended):
   - Go to https://www.mongodb.com/cloud/atlas
   - Create free cluster
   - Get connection string
   - Update MONGODB_URI in .env file

Current connection string: ${process.env.MONGODB_URI}
`);
    process.exit(1);
  }
};

export default connectDB;
