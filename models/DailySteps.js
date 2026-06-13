import mongoose from "mongoose";

const dailyStepsSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
    unique: true, // format: YYYY-MM-DD
  },
  steps: {
    type: Number,
    default: 0,
  },
  limit: {
    type: Number,
    default: 10000,
  },
}, { timestamps: true });

const DailySteps = mongoose.model("DailySteps", dailyStepsSchema);
export default DailySteps;
