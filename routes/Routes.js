import express from "express";
import { getUsers, registerUsers } from "../controllers/userController.js";
import { getAccounts, createAccounts, updateAccounts, deleteAccounts } from "../controllers/accountController.js"
import { getAccountMembers, createAccountMembers, updateAccountMembers, deleteAccountMembers } from "../controllers/accountMemberController.js"
import { getDebt, createDebt, updateDebt, deleteDebt } from "../controllers/debtController.js";
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from "../controllers/transactionController.js";
import { getGoals, createGoal, updateGoal, deleteGoal } from "../controllers/goalController.js";
import { getHabits, createHabit, updateHabit, deleteHabit, checkinHabit } from "../controllers/habitController.js";
import { getWorkouts, createWorkout, updateWorkout, deleteWorkout, checkinWorkout } from "../controllers/workoutController.js";
import { getDiaries, createDiary, updateDiary, deleteDiary } from "../controllers/diaryController.js";
import { getContacts, createContact, updateContact, deleteContact } from "../controllers/contactController.js";
import { getLearnings, createLearning, updateLearning, deleteLearning } from "../controllers/learningController.js";
import { chatWithGF, getChatHistory, clearChatHistory, saveCustomMessage, editMessage, deleteMessageById, reactToMessage, pinMessage, starMessage } from "../controllers/aiController.js";
import { getReminders, createReminder, updateReminder, deleteReminder } from "../controllers/reminderController.js";
import { getPasswords, createPassword, updatePassword, deletePassword } from "../controllers/passwordController.js";

const router = express.Router();

router.get("/users", getUsers);
router.post("/users", registerUsers);

router.get("/accounts", getAccounts);
router.post("/accounts", createAccounts);
router.put("/accounts/:id", updateAccounts);
router.delete("/accounts/:id", deleteAccounts);

router.get("/accountsMembers", getAccountMembers);
router.post("/accountsMembers", createAccountMembers);
router.put("/accountsMembers/:id", updateAccountMembers);
router.delete("/accountsMembers/:id", deleteAccountMembers);

router.get("/debt", getDebt);
router.post("/debt", createDebt);
router.put("/debt/:id", updateDebt);
router.delete("/debt/:id", deleteDebt);

router.get("/transactions", getTransactions);
router.post("/transactions", createTransaction);
router.put("/transactions/:id", updateTransaction);
router.delete("/transactions/:id", deleteTransaction);

router.get("/goals", getGoals);
router.post("/goals", createGoal);
router.put("/goals/:id", updateGoal);
router.delete("/goals/:id", deleteGoal);

router.get("/habits", getHabits);
router.post("/habits", createHabit);
router.put("/habits/:id", updateHabit);
router.delete("/habits/:id", deleteHabit);
router.post("/habits/:id/checkin", checkinHabit);

router.get("/workouts", getWorkouts);
router.post("/workouts", createWorkout);
router.put("/workouts/:id", updateWorkout);
router.delete("/workouts/:id", deleteWorkout);
router.post("/workouts/:id/checkin", checkinWorkout);

router.get("/diaries", getDiaries);
router.post("/diaries", createDiary);
router.put("/diaries/:id", updateDiary);
router.delete("/diaries/:id", deleteDiary);

router.get("/contacts", getContacts);
router.post("/contacts", createContact);
router.put("/contacts/:id", updateContact);
router.delete("/contacts/:id", deleteContact);

router.get("/learnings", getLearnings);
router.post("/learnings", createLearning);
router.put("/learnings/:id", updateLearning);
router.delete("/learnings/:id", deleteLearning);

router.post("/ai/chat", chatWithGF);
router.get("/ai/messages", getChatHistory);
router.delete("/ai/messages", clearChatHistory);
router.post("/ai/messages", saveCustomMessage);
router.put("/ai/messages/:id", editMessage);
router.delete("/ai/messages/:id", deleteMessageById);
router.post("/ai/messages/:id/react", reactToMessage);
router.post("/ai/messages/:id/pin", pinMessage);
router.post("/ai/messages/:id/star", starMessage);

router.get("/reminders", getReminders);
router.post("/reminders", createReminder);
router.put("/reminders/:id", updateReminder);
router.delete("/reminders/:id", deleteReminder);

router.get("/passwords", getPasswords);
router.post("/passwords", createPassword);
router.put("/passwords/:id", updatePassword);
router.delete("/passwords/:id", deletePassword);

export default router;
