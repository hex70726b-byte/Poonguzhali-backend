import mongoose from "mongoose";

const encryptedField = {
  iv: { type: String, required: true },
  encryptedData: { type: String, required: true },
};

const contactSchema = new mongoose.Schema({
  fullName: encryptedField,
  phoneNumber: encryptedField,
  email: encryptedField,
  address: encryptedField,
  company: encryptedField,
  jobTitle: encryptedField,
  birthday: encryptedField,
  profilePhoto: {
    iv: { type: String, default: "" },
    encryptedData: { type: String, default: "" },
  },
  whatsAppNumber: encryptedField,
  website: encryptedField,
  notes: encryptedField,
  nickname: encryptedField,
  groupCategory: {
    type: String,
    enum: ["Family", "Friends", "Work", "Other"],
    default: "Other",
  },
  socialMediaLinks: encryptedField,
  multipleNumbers: encryptedField,
  multipleEmails: encryptedField,
}, { timestamps: true });

const Contact = mongoose.model("Contacts", contactSchema);
export default Contact;
