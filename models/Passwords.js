import mongoose from "mongoose";

const encryptedField = {
  iv: { type: String, required: true },
  encryptedData: { type: String, required: true },
};

const passwordSchema = new mongoose.Schema({
  website: encryptedField,
  idNo: encryptedField,
  username: encryptedField, // ID
  name: encryptedField,
  gmail: encryptedField,
  number: encryptedField,
  password: encryptedField,
  category: { type: String, enum: ["important", "others"], default: "others" },
}, { timestamps: true });

const Password = mongoose.model("Passwords", passwordSchema);
export default Password;
