import mongoose from "mongoose";

const encryptedField = {
  iv: { type: String, required: true },
  encryptedData: { type: String, required: true },
};

const habitSchema = new mongoose.Schema({
  habitName: encryptedField,
  type: {
    type: String,
    enum: ["single", "multiple"],
    required: true,
  },
  startingTime: {
    iv: { type: String, default: "" },
    encryptedData: { type: String, default: "" },
  },
  endingTime: {
    iv: { type: String, default: "" },
    encryptedData: { type: String, default: "" },
  },
  gap: {
    iv: { type: String, default: "" },
    encryptedData: { type: String, default: "" },
  },
  customChat: {
    iv: { type: String, default: "" },
    encryptedData: { type: String, default: "" },
  },
  streak: { type: Number, default: 0 },
  lastCompletedDate: { type: String, default: "" },
  multipleCompletions: { type: Number, default: 0 },
  lastSentReminderTime: { type: String, default: "" },
  waitingForReply: { type: Boolean, default: false },
}, { timestamps: true });

const Habit = mongoose.model("Habits", habitSchema);
export default Habit;
