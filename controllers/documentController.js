import { encryptData, decryptData } from "../utils/crypto.js";
import DocumentFolder from "../models/Documents.js";

const safeDecrypt = (field) => {
  if (!field || !field.encryptedData || !field.iv) return "";
  try {
    return decryptData(field.encryptedData, field.iv);
  } catch (e) {
    return "";
  }
};

const safeEncrypt = (val) => {
  return encryptData(val || "");
};

// Fetch all decrypted folders & links from MongoDB
export const getDocuments = async (req, res) => {
  try {
    const folders = await DocumentFolder.find().sort({ createdAt: 1 });

    const decrypted = folders.map((f) => ({
      id: f.id,
      name: safeDecrypt(f.name),
      colorValue: f.colorValue,
      links: f.links.map((l) => ({
        id: l.id,
        name: safeDecrypt(l.name),
        url: safeDecrypt(l.url),
        createdAt: l.createdAt,
      })),
    }));

    res.json(decrypted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Sync all local folders & links directly to MongoDB
export const syncDocuments = async (req, res) => {
  try {
    const foldersArray = req.body;

    if (!Array.isArray(foldersArray)) {
      return res.status(400).json({ message: "Request body must be an array of folders" });
    }

    // Clear previous documents and rewrite the sync status
    await DocumentFolder.deleteMany({});

    const toInsert = foldersArray.map((f) => ({
      id: f.id,
      name: safeEncrypt(f.name),
      colorValue: f.colorValue,
      links: (f.links || []).map((l) => ({
        id: l.id,
        name: safeEncrypt(l.name),
        url: safeEncrypt(l.url),
        createdAt: l.createdAt ? new Date(l.createdAt) : new Date(),
      })),
    }));

    await DocumentFolder.insertMany(toInsert);

    res.status(200).json({ message: "Documents synced successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
