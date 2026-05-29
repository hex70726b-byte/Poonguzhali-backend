import { encryptData, decryptData } from "../utils/crypto.js";
import Reminder from "../models/Reminder.js";

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

export const getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find().sort({ createdAt: -1 });

    const decryptedReminders = reminders.map((r) => ({
      _id: r._id,
      title: safeDecrypt(r.title),
      dateTime: safeDecrypt(r.dateTime),
      type: r.type || "custom",
      contactId: r.contactId || "",
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    res.json(decryptedReminders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createReminder = async (req, res) => {
  try {
    const { title, dateTime, type, contactId } = req.body;

    if (!title || !dateTime) {
      return res.status(400).json({ message: "title and dateTime are required" });
    }

    const reminder = await Reminder.create({
      title: safeEncrypt(title),
      dateTime: safeEncrypt(dateTime),
      type: type || "custom",
      contactId: contactId || "",
    });

    res.status(201).json({
      message: "Reminder created successfully",
      reminder: {
        _id: reminder._id,
        title,
        dateTime,
        type: reminder.type,
        contactId: reminder.contactId,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, dateTime, type, contactId } = req.body;

    const reminder = await Reminder.findById(id);
    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    if (title !== undefined) reminder.title = safeEncrypt(title);
    if (dateTime !== undefined) reminder.dateTime = safeEncrypt(dateTime);
    if (type !== undefined) reminder.type = type;
    if (contactId !== undefined) reminder.contactId = contactId;

    await reminder.save();

    res.json({
      message: "Reminder updated successfully",
      reminder: {
        _id: reminder._id,
        title: title || safeDecrypt(reminder.title),
        dateTime: dateTime || safeDecrypt(reminder.dateTime),
        type: reminder.type,
        contactId: reminder.contactId,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Reminder.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    res.json({ message: "Reminder deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
