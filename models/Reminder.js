import mongoose from "mongoose";

const encryptedField = {
  iv: { type: String, required: true },
  encryptedData: { type: String, required: true },
};

const reminderSchema = new mongoose.Schema({
  title: encryptedField,
  dateTime: encryptedField, // YYYY-MM-DD HH:mm or similar
  type: {
    type: String,
    enum: ["birthday", "custom"],
    default: "custom",
  },
  contactId: { type: String, default: "" },
}, { timestamps: true });

const Reminder = mongoose.model("Reminder", reminderSchema);
export default Reminder;
