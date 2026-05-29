import { encryptData, decryptData } from "../utils/crypto.js";
import DiaryModelsData from "../models/Diaries.js";

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

export const getDiaries = async (req, res) => {
  try {
    const diaries = await DiaryModelsData.find().sort({ createdAt: -1 });

    const decryptedDiaries = diaries.map((d) => ({
      _id: d._id,
      date: safeDecrypt(d.date),
      day: safeDecrypt(d.day),
      diary: safeDecrypt(d.diary),
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }));

    res.json(decryptedDiaries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createDiary = async (req, res) => {
  try {
    const { date, day, diary } = req.body;

    if (!date || !day || !diary) {
      return res.status(400).json({ message: "date, day and diary text are required" });
    }

    const encryptedDate = safeEncrypt(date);
    const encryptedDay = safeEncrypt(day);
    const encryptedDiary = safeEncrypt(diary);

    const newDiary = await DiaryModelsData.create({
      date: encryptedDate,
      day: encryptedDay,
      diary: encryptedDiary,
    });

    res.status(201).json({
      message: "Diary stored successfully",
      diary: {
        _id: newDiary._id,
        date,
        day,
        diary,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDiary = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, day, diary } = req.body;

    const existingDiary = await DiaryModelsData.findById(id);
    if (!existingDiary) {
      return res.status(404).json({ message: "Diary entry not found" });
    }

    if (date !== undefined) existingDiary.date = safeEncrypt(date);
    if (day !== undefined) existingDiary.day = safeEncrypt(day);
    if (diary !== undefined) existingDiary.diary = safeEncrypt(diary);

    await existingDiary.save();

    res.json({
      message: "Diary entry updated successfully",
      diary: {
        _id: existingDiary._id,
        date: date || safeDecrypt(existingDiary.date),
        day: day || safeDecrypt(existingDiary.day),
        diary: diary || safeDecrypt(existingDiary.diary),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteDiary = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await DiaryModelsData.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Diary entry not found" });
    }

    res.json({ message: "Diary entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
