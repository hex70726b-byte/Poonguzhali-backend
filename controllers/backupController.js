import Workout from "../models/Workouts.js";
import Accounts from "../models/Accounts.js";
import AccountMembers from "../models/accountMembers.js";
import Transaction from "../models/Transactions.js";
import Debt from "../models/debt.js";
import Goal from "../models/Goal.js";
import Habit from "../models/Habits.js";
import Diary from "../models/Diaries.js";
import Learning from "../models/Learnings.js";
import { decryptData } from "../utils/crypto.js";

const safeDecrypt = (field) => {
  if (!field || !field.encryptedData || !field.iv) return "";
  try {
    return decryptData(field.encryptedData, field.iv);
  } catch (e) {
    return "";
  }
};

const isToday = (dateObj, todayStr) => {
  if (!dateObj) return false;
  const d = new Date(dateObj);
  if (isNaN(d.getTime())) return false;
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const date = String(d.getDate()).padStart(2, "0");
  const localDateStr = `${year}-${month}-${date}`;
  
  const utcYear = d.getUTCFullYear();
  const utcMonth = String(d.getUTCMonth() + 1).padStart(2, "0");
  const utcDate = String(d.getUTCDate()).padStart(2, "0");
  const utcDateStr = `${utcYear}-${utcMonth}-${utcDate}`;
  
  return localDateStr === todayStr || utcDateStr === todayStr;
};

export const getTodayActivity = async (req, res) => {
  try {
    const todayStr = req.query.date || new Date().toISOString().split("T")[0];
    
    // 1. Workouts
    let workoutActivity = [];
    try {
      const workouts = await Workout.find();
      const decrypted = workouts.map(w => ({
        _id: w._id,
        workoutName: safeDecrypt(w.workoutName),
        type: w.type,
        target: safeDecrypt(w.target),
        streak: w.streak ?? 0,
        lastCompletedDate: w.lastCompletedDate ?? "",
        scheduledDays: w.scheduledDays ?? [],
        createdAt: w.createdAt,
        updatedAt: w.updatedAt
      }));
      workoutActivity = decrypted.filter(w => 
        w.lastCompletedDate === todayStr || isToday(w.createdAt, todayStr) || isToday(w.updatedAt, todayStr)
      );
    } catch (e) {
      console.error("Error backing up workouts:", e);
    }

    // 2. Wallets (Accounts & AccountMembers)
    let walletsActivity = [];
    try {
      const accounts = await Accounts.find();
      const members = await AccountMembers.find();
      
      const decryptedAccounts = accounts.map(a => ({
        _id: a._id,
        accountName: safeDecrypt(a.accountName),
        createdAt: a.createdAt,
        updatedAt: a.updatedAt
      }));
      
      const decryptedMembers = members.map(m => ({
        _id: m._id,
        AccountMemberName: safeDecrypt(m.AccountMemberName),
        Amount: parseFloat(safeDecrypt(m.Amount) || "0"),
        AccountId: m.AccountId
      }));
      
      walletsActivity = decryptedAccounts.map(acc => {
        const accMembers = decryptedMembers.filter(m => m.AccountId && m.AccountId.toString() === acc._id.toString());
        return {
          _id: acc._id,
          accountName: acc.accountName,
          members: accMembers.map(m => ({
            _id: m._id,
            AccountMemberName: m.AccountMemberName,
            Amount: m.Amount
          })),
          createdAt: acc.createdAt,
          updatedAt: acc.updatedAt
        };
      });
    } catch (e) {
      console.error("Error backing up wallets:", e);
    }

    // 3. Transactions
    let transactionsActivity = [];
    try {
      const transactions = await Transaction.find()
        .populate("memberId")
        .populate("accountId")
        .populate("toMemberId")
        .populate("toAccountId");
        
      const decrypted = transactions.map(t => ({
        _id: t._id,
        type: t.type,
        amount: parseFloat(safeDecrypt(t.amount) || "0"),
        member: t.memberId ? safeDecrypt(t.memberId.AccountMemberName) : "",
        account: t.accountId ? safeDecrypt(t.accountId.accountName) : "",
        toMember: t.toMemberId ? safeDecrypt(t.toMemberId.AccountMemberName) : "",
        toAccount: t.toAccountId ? safeDecrypt(t.toAccountId.accountName) : "",
        others: t.others,
        category: safeDecrypt(t.category),
        note: safeDecrypt(t.note),
        createdAt: t.createdAt,
        updatedAt: t.updatedAt
      }));
      
      transactionsActivity = decrypted.filter(t => 
        isToday(t.createdAt, todayStr) || isToday(t.updatedAt, todayStr)
      );
    } catch (e) {
      console.error("Error backing up transactions:", e);
    }

    // 4. Debts
    let debtsActivity = [];
    try {
      const debts = await Debt.find();
      const decrypted = debts.map(d => ({
        _id: d._id,
        debtHolderName: safeDecrypt(d.debtHolderName),
        debtAmount: parseFloat(safeDecrypt(d.debtAmount) || "0"),
        dueDate: safeDecrypt(d.dueDate),
        createdAt: d.createdAt,
        updatedAt: d.updatedAt
      }));
      debtsActivity = decrypted;
    } catch (e) {
      console.error("Error backing up debts:", e);
    }

    // 5. Goals
    let goalsActivity = [];
    try {
      const goals = await Goal.find();
      const decrypted = goals.map(g => ({
        _id: g._id,
        goalName: safeDecrypt(g.goalName),
        type: g.type,
        amount: parseFloat(safeDecrypt(g.amount) || "0"),
        savedAmount: parseFloat(safeDecrypt(g.savedAmount) || "0"),
        description: safeDecrypt(g.description),
        createdAt: g.createdAt,
        updatedAt: g.updatedAt
      }));
      goalsActivity = decrypted.filter(g => 
        isToday(g.createdAt, todayStr) || isToday(g.updatedAt, todayStr)
      );
    } catch (e) {
      console.error("Error backing up goals:", e);
    }

    // 6. Habits
    let habitsActivity = [];
    try {
      const habits = await Habit.find();
      const decrypted = habits.map(h => ({
        _id: h._id,
        habitName: safeDecrypt(h.habitName),
        type: h.type,
        startingTime: safeDecrypt(h.startingTime),
        endingTime: safeDecrypt(h.endingTime),
        gap: safeDecrypt(h.gap),
        streak: h.streak ?? 0,
        lastCompletedDate: h.lastCompletedDate ?? "",
        multipleCompletions: h.multipleCompletions ?? 0,
        createdAt: h.createdAt,
        updatedAt: h.updatedAt
      }));
      habitsActivity = decrypted.filter(h => 
        h.lastCompletedDate === todayStr || isToday(h.createdAt, todayStr) || isToday(h.updatedAt, todayStr)
      );
    } catch (e) {
      console.error("Error backing up habits:", e);
    }

    // 7. Diaries
    let diariesActivity = [];
    try {
      const diaries = await Diary.find();
      const decrypted = diaries.map(d => ({
        _id: d._id,
        date: safeDecrypt(d.date),
        day: safeDecrypt(d.day),
        diary: safeDecrypt(d.diary),
        createdAt: d.createdAt,
        updatedAt: d.updatedAt
      }));
      diariesActivity = decrypted.filter(d => 
        d.date === todayStr || isToday(d.createdAt, todayStr) || isToday(d.updatedAt, todayStr)
      );
    } catch (e) {
      console.error("Error backing up diaries:", e);
    }

    // 8. Learnings
    let learningsActivity = [];
    try {
      const learnings = await Learning.find();
      const decrypted = learnings.map(l => ({
        _id: l._id,
        learningTopic: safeDecrypt(l.learningTopic),
        content: safeDecrypt(l.content),
        links: safeDecrypt(l.links),
        createdAt: l.createdAt,
        updatedAt: l.updatedAt
      }));
      learningsActivity = decrypted.filter(l => 
        isToday(l.createdAt, todayStr) || isToday(l.updatedAt, todayStr)
      );
    } catch (e) {
      console.error("Error backing up learnings:", e);
    }

    res.json({
      date: todayStr,
      activity: {
        workouts: workoutActivity,
        wallets: walletsActivity,
        transactions: transactionsActivity,
        debts: debtsActivity,
        goals: goalsActivity,
        habits: habitsActivity,
        diaries: diariesActivity,
        learnings: learningsActivity
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
