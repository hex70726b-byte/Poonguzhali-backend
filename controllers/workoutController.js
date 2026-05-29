import { encryptData, decryptData } from "../utils/crypto.js";
import WorkoutModelsData from "../models/Workouts.js";

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

export const getWorkouts = async (req, res) => {
  try {
    const workouts = await WorkoutModelsData.find().sort({ createdAt: -1 });

    const decryptedWorkouts = workouts.map((w) => ({
      _id: w._id,
      workoutName: safeDecrypt(w.workoutName),
      type: w.type,
      target: safeDecrypt(w.target),
      streak: w.streak ?? 0,
      lastCompletedDate: w.lastCompletedDate ?? "",
      scheduledDays: w.scheduledDays ?? [],
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
    }));

    res.json(decryptedWorkouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createWorkout = async (req, res) => {
  try {
    const { workoutName, type, target, scheduledDays } = req.body;

    if (!workoutName || !type) {
      return res.status(400).json({ message: "workoutName and type are required" });
    }

    const encryptedName = safeEncrypt(workoutName);
    const encryptedTarget = safeEncrypt(target);

    const workout = await WorkoutModelsData.create({
      workoutName: encryptedName,
      type,
      target: encryptedTarget,
      streak: 0,
      lastCompletedDate: "",
      scheduledDays: scheduledDays || [],
    });

    res.status(201).json({
      message: "Workout stored successfully",
      workout: {
        _id: workout._id,
        workoutName,
        type: workout.type,
        target,
        streak: 0,
        lastCompletedDate: "",
        scheduledDays: workout.scheduledDays,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateWorkout = async (req, res) => {
  try {
    const { id } = req.params;
    const { workoutName, type, target, scheduledDays } = req.body;

    const workout = await WorkoutModelsData.findById(id);
    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    if (workoutName !== undefined) workout.workoutName = safeEncrypt(workoutName);
    if (type !== undefined) workout.type = type;
    if (target !== undefined) workout.target = safeEncrypt(target);
    if (scheduledDays !== undefined) workout.scheduledDays = scheduledDays;

    await workout.save();

    res.json({
      message: "Workout updated successfully",
      workout: {
        _id: workout._id,
        workoutName: workoutName || safeDecrypt(workout.workoutName),
        type: workout.type,
        target: target || safeDecrypt(workout.target),
        streak: workout.streak ?? 0,
        lastCompletedDate: workout.lastCompletedDate ?? "",
        scheduledDays: workout.scheduledDays,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteWorkout = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await WorkoutModelsData.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Workout not found" });
    }

    res.json({ message: "Workout deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const checkinWorkout = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.body || {};
    const workout = await WorkoutModelsData.findById(id);
    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    const targetDateStr = date || new Date().toISOString().split("T")[0];

    if (workout.lastCompletedDate === targetDateStr) {
      return res.json({
        message: "Workout already completed on this date",
        workout: {
          _id: workout._id,
          workoutName: safeDecrypt(workout.workoutName),
          type: workout.type,
          streak: workout.streak,
          lastCompletedDate: workout.lastCompletedDate,
        }
      });
    }

    if (workout.lastCompletedDate) {
      const last = new Date(workout.lastCompletedDate + "T00:00:00");
      const current = new Date(targetDateStr + "T00:00:00");
      const diffTime = Math.abs(current.getTime() - last.getTime());
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        workout.streak += 1;
      } else {
        workout.streak = 1;
      }
    } else {
      workout.streak = 1;
    }
    
    workout.lastCompletedDate = targetDateStr;

    await workout.save();

    res.json({
      message: "Workout checked-in successfully",
      workout: {
        _id: workout._id,
        workoutName: safeDecrypt(workout.workoutName),
        type: workout.type,
        target: safeDecrypt(workout.target),
        streak: workout.streak,
        lastCompletedDate: workout.lastCompletedDate,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
