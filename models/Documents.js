import mongoose from "mongoose";

const encryptedField = {
  iv: { type: String, required: true },
  encryptedData: { type: String, required: true },
};

const documentLinkSchema = new mongoose.Schema({
  id: { type: String, required: true }, // Client-side unique ID
  name: encryptedField,
  url: encryptedField,
  createdAt: { type: Date, default: Date.now },
});

const documentFolderSchema = new mongoose.Schema({
  id: { type: String, required: true }, // Client-side unique ID
  name: encryptedField,
  colorValue: { type: Number, required: true },
  links: [documentLinkSchema],
}, { timestamps: true });

const DocumentFolder = mongoose.model("DocumentFolders", documentFolderSchema);
export default DocumentFolder;
