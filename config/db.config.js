// Importing mongoose
import mongoose from "mongoose";

// async function connection 
const connectDB = async () => {
  try {
    // MongoDB connection string with fallback to MongoDB localhost for development
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/momentis";

    /*
      These options keep Mongoose from throwing deprecation warnings
      and ensure a stable connection in both dev and production.
      NB: I saw it on YouTube 
    */
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // fail fast (5 secs) if MongoDB isn't reachable. Rather than wasting people's time
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
