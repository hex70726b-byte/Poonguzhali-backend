import { encryptData, decryptData } from "../utils/crypto.js";
import HabitModelsData from "../models/Habits.js";

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

export const getHabits = async (req, res) => {
  try {
    const habits = await HabitModelsData.find().sort({ createdAt: -1 });

    const decryptedHabits = habits.map((h) => ({
      _id: h._id,
      habitName: safeDecrypt(h.habitName),
      type: h.type,
      startingTime: safeDecrypt(h.startingTime),
      endingTime: safeDecrypt(h.endingTime),
      gap: safeDecrypt(h.gap),
      customChat: safeDecrypt(h.customChat),
      streak: h.streak ?? 0,
      lastCompletedDate: h.lastCompletedDate ?? "",
      multipleCompletions: h.multipleCompletions ?? 0,
      lastSentReminderTime: h.lastSentReminderTime ?? "",
      waitingForReply: h.waitingForReply ?? false,
      createdAt: h.createdAt,
      updatedAt: h.updatedAt,
    }));

    res.json(decryptedHabits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createHabit = async (req, res) => {
  try {
    const { habitName, type, startingTime, endingTime, gap, customChat } = req.body;

    if (!habitName || !type) {
      return res.status(400).json({ message: "habitName and type are required" });
    }

    const encryptedHabitName = safeEncrypt(habitName);
    const encryptedStartingTime = startingTime ? safeEncrypt(startingTime) : { iv: "", encryptedData: "" };
    const encryptedEndingTime = type === "multiple" && endingTime ? safeEncrypt(endingTime) : { iv: "", encryptedData: "" };
    const encryptedGap = type === "multiple" && gap ? safeEncrypt(gap) : { iv: "", encryptedData: "" };
    const encryptedCustomChat = customChat ? safeEncrypt(customChat) : { iv: "", encryptedData: "" };

    const habit = await HabitModelsData.create({
      habitName: encryptedHabitName,
      type,
      startingTime: encryptedStartingTime,
      endingTime: encryptedEndingTime,
      gap: encryptedGap,
      customChat: encryptedCustomChat,
      streak: 0,
      lastCompletedDate: "",
      multipleCompletions: 0,
      lastSentReminderTime: "",
      waitingForReply: false,
    });

    res.status(201).json({
      message: "Habit stored successfully",
      habit: {
        _id: habit._id,
        habitName,
        type: habit.type,
        startingTime: startingTime || "",
        endingTime: type === "multiple" ? endingTime : "",
        gap: type === "multiple" ? gap : "",
        customChat: customChat || "",
        streak: 0,
        lastCompletedDate: "",
        multipleCompletions: 0,
        lastSentReminderTime: "",
        waitingForReply: false,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const { habitName, type, startingTime, endingTime, gap, customChat, lastSentReminderTime, waitingForReply } = req.body;

    const habit = await HabitModelsData.findById(id);
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    if (habitName !== undefined) habit.habitName = safeEncrypt(habitName);
    if (type !== undefined) {
      habit.type = type;
    }

    if (startingTime !== undefined) habit.startingTime = safeEncrypt(startingTime);
    if (customChat !== undefined) habit.customChat = safeEncrypt(customChat);
    if (lastSentReminderTime !== undefined) habit.lastSentReminderTime = lastSentReminderTime;
    if (waitingForReply !== undefined) habit.waitingForReply = waitingForReply;

    if (habit.type === "multiple") {
      if (endingTime !== undefined) habit.endingTime = safeEncrypt(endingTime);
      if (gap !== undefined) habit.gap = safeEncrypt(gap);
    } else {
      habit.endingTime = { iv: "", encryptedData: "" };
      habit.gap = { iv: "", encryptedData: "" };
    }

    await habit.save();

    res.json({
      message: "Habit updated successfully",
      habit: {
        _id: habit._id,
        habitName: habitName || safeDecrypt(habit.habitName),
        type: habit.type,
        startingTime: startingTime || safeDecrypt(habit.startingTime) || "",
        endingTime: habit.type === "multiple" ? (endingTime || safeDecrypt(habit.endingTime) || "") : "",
        gap: habit.type === "multiple" ? (gap || safeDecrypt(habit.gap) || "") : "",
        customChat: customChat || safeDecrypt(habit.customChat) || "",
        streak: habit.streak ?? 0,
        lastCompletedDate: habit.lastCompletedDate ?? "",
        multipleCompletions: habit.multipleCompletions ?? 0,
        lastSentReminderTime: habit.lastSentReminderTime ?? "",
        waitingForReply: habit.waitingForReply ?? false,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await HabitModelsData.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Habit not found" });
    }

    res.json({ message: "Habit deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const checkinHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const habit = await HabitModelsData.findById(id);
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    const todayStr = new Date().toISOString().split("T")[0];

    if (habit.type === "single") {
      if (habit.lastCompletedDate === todayStr) {
        return res.json({
          message: "Already completed today",
          habit: {
            _id: habit._id,
            habitName: safeDecrypt(habit.habitName),
            type: habit.type,
            streak: habit.streak,
            lastCompletedDate: habit.lastCompletedDate,
          }
        });
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      if (habit.lastCompletedDate === yesterdayStr) {
        habit.streak += 1;
      } else {
        habit.streak = 1;
      }
      habit.lastCompletedDate = todayStr;
    } else {
      if (habit.lastCompletedDate !== todayStr) {
        habit.multipleCompletions = 1;
      } else {
        habit.multipleCompletions += 1;
      }
      habit.lastCompletedDate = todayStr;
    }

    await habit.save();

    res.json({
      message: "Checkin recorded successfully",
      habit: {
        _id: habit._id,
        habitName: safeDecrypt(habit.habitName),
        type: habit.type,
        startingTime: safeDecrypt(habit.startingTime),
        endingTime: safeDecrypt(habit.endingTime),
        gap: safeDecrypt(habit.gap),
        customChat: safeDecrypt(habit.customChat),
        streak: habit.streak,
        lastCompletedDate: habit.lastCompletedDate,
        multipleCompletions: habit.multipleCompletions,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
