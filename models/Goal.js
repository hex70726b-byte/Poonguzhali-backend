import mongoose from "mongoose";

const goalSchema = new mongoose.Schema({
  goalName: {
    iv: { type: String, required: true },
    encryptedData: { type: String, required: true },
  },
  type: {
    type: String,
    enum: ["general", "money"],
    required: true,
  },
  amount: {
    iv: { type: String, default: "" },
    encryptedData: { type: String, default: "" },
  },
  savedAmount: {
    iv: { type: String, default: "" },
    encryptedData: { type: String, default: "" },
  },
  description: {
    iv: { type: String, default: "" },
    encryptedData: { type: String, default: "" },
  },
}, { timestamps: true });

const Goal = mongoose.model("Goal", goalSchema);
export default Goal;
