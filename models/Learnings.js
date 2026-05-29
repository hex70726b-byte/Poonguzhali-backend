import mongoose from "mongoose";

const encryptedField = {
  iv: { type: String, required: true },
  encryptedData: { type: String, required: true },
};

const learningSchema = new mongoose.Schema({
  learningTopic: encryptedField,
  content: encryptedField,
  links: encryptedField,
}, { timestamps: true });

const Learning = mongoose.model("Learnings", learningSchema);
export default Learning;
