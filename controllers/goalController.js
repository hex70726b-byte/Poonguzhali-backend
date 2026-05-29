import { encryptData, decryptData } from "../utils/crypto.js";
import GoalModelsData from "../models/Goal.js";

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

export const getGoals = async (req, res) => {
  try {
    const goals = await GoalModelsData.find().sort({ createdAt: -1 });

    const decryptedGoals = goals.map((g) => ({
      _id: g._id,
      goalName: safeDecrypt(g.goalName),
      type: g.type,
      amount: safeDecrypt(g.amount),
      savedAmount: safeDecrypt(g.savedAmount) || "0",
      description: safeDecrypt(g.description),
      createdAt: g.createdAt,
      updatedAt: g.updatedAt,
    }));

    res.json(decryptedGoals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createGoal = async (req, res) => {
  try {
    const { goalName, type, amount, description } = req.body;

    if (!goalName || !type) {
      return res.status(400).json({ message: "goalName and type are required" });
    }

    const encryptedGoalName = safeEncrypt(goalName);
    const encryptedAmount = type === "money" ? safeEncrypt(amount) : { iv: "", encryptedData: "" };
    const encryptedSavedAmount = type === "money" ? safeEncrypt("0") : { iv: "", encryptedData: "" };
    const encryptedDescription = safeEncrypt(description);

    const goal = await GoalModelsData.create({
      goalName: encryptedGoalName,
      type,
      amount: encryptedAmount,
      savedAmount: encryptedSavedAmount,
      description: encryptedDescription,
    });

    res.status(201).json({
      message: "Goal stored successfully",
      goal: {
        _id: goal._id,
        goalName: goalName,
        type: goal.type,
        amount: type === "money" ? amount : "",
        savedAmount: type === "money" ? "0" : "",
        description: description,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const { goalName, type, amount, description } = req.body;

    const goal = await GoalModelsData.findById(id);
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    if (goalName !== undefined) goal.goalName = safeEncrypt(goalName);
    if (type !== undefined) {
      goal.type = type;
      if (type === "money" && amount !== undefined) {
        goal.amount = safeEncrypt(amount);
      } else if (type === "general") {
        goal.amount = { iv: "", encryptedData: "" };
      }
    } else if (goal.type === "money" && amount !== undefined) {
      goal.amount = safeEncrypt(amount);
    }
    if (description !== undefined) goal.description = safeEncrypt(description);

    await goal.save();

    res.json({
      message: "Goal updated successfully",
      goal: {
        _id: goal._id,
        goalName: goalName || safeDecrypt(goal.goalName),
        type: goal.type,
        amount: goal.type === "money" ? (amount || safeDecrypt(goal.amount)) : "",
        savedAmount: goal.type === "money" ? (safeDecrypt(goal.savedAmount) || "0") : "",
        description: description || safeDecrypt(goal.description),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await GoalModelsData.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Goal not found" });
    }

    res.json({ message: "Goal deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
