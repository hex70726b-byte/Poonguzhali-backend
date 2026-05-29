import mongoose from "mongoose";

const connectDB = async () => {
  const primaryURI = process.env.MONGO_URI;
  const fallbackURI = "mongodb://127.0.0.1:27017/personal_agent";

  try {
    await mongoose.connect(primaryURI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ MongoDB Connected to Atlas successfully!");
  } catch (primaryError) {
    console.warn(`⚠️ MongoDB Atlas connection failed: ${primaryError.message}`);
    console.log("🔄 Attempting local MongoDB connection fallback...");

    try {
      // Disconnect any failed/stale primary connection before attempting fallback
      await mongoose.disconnect();
      await mongoose.connect(fallbackURI, {
        serverSelectionTimeoutMS: 3000,
      });
      console.log("✅ MongoDB Connected to local instance successfully!");
    } catch (fallbackError) {
      console.warn("❌ Local MongoDB fallback also failed (not running/installed).");
      console.log("ℹ️ Server is running in Offline Mode.");
      console.log("💡 Tip: Set correct credentials in backend/.env or start a local MongoDB server to enable database persistence.");
    }
  }
};

export default connectDB;