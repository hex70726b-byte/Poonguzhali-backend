import mongoose from "mongoose";

const encryptedField = {
  iv: { type: String, required: true },
  encryptedData: { type: String, required: true },
};

const workoutSchema = new mongoose.Schema({
  workoutName: encryptedField,
  type: {
    type: String,
    enum: ["time", "count"],
    required: true,
  },
  target: {
    iv: { type: String, default: "" },
    encryptedData: { type: String, default: "" },
  },
  streak: { type: Number, default: 0 },
  lastCompletedDate: { type: String, default: "" },
  scheduledDays: { type: [String], default: [] },
}, { timestamps: true });

const Workout = mongoose.model("Workouts", workoutSchema);
export default Workout;
