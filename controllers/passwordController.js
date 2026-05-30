import { encryptData, decryptData } from "../utils/crypto.js";
import PasswordModelsData from "../models/Passwords.js";

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

export const getPasswords = async (req, res) => {
  try {
    const passwords = await PasswordModelsData.find().sort({ createdAt: -1 });

    const decryptedPasswords = passwords.map((p) => ({
      _id: p._id,
      website: safeDecrypt(p.website),
      idNo: safeDecrypt(p.idNo),
      username: safeDecrypt(p.username),
      name: safeDecrypt(p.name),
      gmail: safeDecrypt(p.gmail),
      number: safeDecrypt(p.number),
      password: safeDecrypt(p.password),
      category: p.category,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    res.json(decryptedPasswords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPassword = async (req, res) => {
  try {
    const { website, idNo, username, name, gmail, number, password, category } = req.body;

    if (!website) {
      return res.status(400).json({ message: "website is required" });
    }

    const newPassword = await PasswordModelsData.create({
      website: safeEncrypt(website),
      idNo: safeEncrypt(idNo || ""),
      username: safeEncrypt(username || ""),
      name: safeEncrypt(name || ""),
      gmail: safeEncrypt(gmail || ""),
      number: safeEncrypt(number || ""),
      password: safeEncrypt(password || ""),
      category: category || "others",
    });

    res.status(201).json({
      message: "Password stored successfully",
      password: {
        _id: newPassword._id,
        website,
        idNo,
        username,
        name,
        gmail,
        number,
        password,
        category: newPassword.category,
        createdAt: newPassword.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { website, idNo, username, name, gmail, number, password, category } = req.body;

    const existingPassword = await PasswordModelsData.findById(id);
    if (!existingPassword) {
      return res.status(404).json({ message: "Password entry not found" });
    }

    if (website !== undefined) existingPassword.website = safeEncrypt(website);
    if (idNo !== undefined) existingPassword.idNo = safeEncrypt(idNo);
    if (username !== undefined) existingPassword.username = safeEncrypt(username);
    if (name !== undefined) existingPassword.name = safeEncrypt(name);
    if (gmail !== undefined) existingPassword.gmail = safeEncrypt(gmail);
    if (number !== undefined) existingPassword.number = safeEncrypt(number);
    if (password !== undefined) existingPassword.password = safeEncrypt(password);
    if (category !== undefined) existingPassword.category = category;

    await existingPassword.save();

    res.json({
      message: "Password entry updated successfully",
      password: {
        _id: existingPassword._id,
        website: website !== undefined ? website : safeDecrypt(existingPassword.website),
        idNo: idNo !== undefined ? idNo : safeDecrypt(existingPassword.idNo),
        username: username !== undefined ? username : safeDecrypt(existingPassword.username),
        name: name !== undefined ? name : safeDecrypt(existingPassword.name),
        gmail: gmail !== undefined ? gmail : safeDecrypt(existingPassword.gmail),
        number: number !== undefined ? number : safeDecrypt(existingPassword.number),
        password: password !== undefined ? password : safeDecrypt(existingPassword.password),
        category: existingPassword.category,
        createdAt: existingPassword.createdAt,
        updatedAt: existingPassword.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await PasswordModelsData.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Password entry not found" });
    }

    res.json({ message: "Password entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
