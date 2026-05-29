import mongoose from "mongoose";

const encryptedField = {
  iv: { type: String, required: true },
  encryptedData: { type: String, required: true },
};

const diarySchema = new mongoose.Schema({
  date: encryptedField,
  day: encryptedField,
  diary: encryptedField,
}, { timestamps: true });

const Diary = mongoose.model("Diaries", diarySchema);
export default Diary;
