import { encryptData, decryptData } from "../utils/crypto.js";
import Transaction from "../models/Transactions.js";
import AccountMembersModelsData from "../models/accountMembers.js";
import DebtModelsData from "../models/debt.js";
import GoalModelsData from "../models/Goal.js";

// Helper: safely decrypt an encrypted field (returns '' if missing/null)
const safeDecrypt = (field) => {
  if (!field || !field.encryptedData || !field.iv) return "";
  return decryptData(field.encryptedData, field.iv);
};

// Helper: format a transaction doc to plain object
const formatTransaction = (t) => ({
  _id: t._id,
  type: t.type,
  amount: safeDecrypt(t.amount),
  memberId: t.memberId,
  accountId: t.accountId,
  toMemberId: t.toMemberId ?? null,
  toAccountId: t.toAccountId ?? null,
  others: t.others ?? "none",
  debtId: t.debtId ?? null,
  goalId: t.goalId ?? null,
  category: safeDecrypt(t.category),
  note: safeDecrypt(t.note),
  createdAt: t.createdAt,
  updatedAt: t.updatedAt,
});

// Helper: adjust account member balance
const adjustMemberBalance = async (memberId, changeAmount) => {
  if (!memberId) return;
  const member = await AccountMembersModelsData.findById(memberId);
  if (!member) return;

  const decryptedAmt = decryptData(member.Amount.encryptedData, member.Amount.iv);
  const oldAmt = parseFloat(decryptedAmt || "0");
  const newAmt = oldAmt + changeAmount;

  const encAmt = encryptData(newAmt.toString());
  member.Amount = encAmt;
  await member.save();
};

// Helper: adjust debt balance
const adjustDebtBalance = async (debtId, changeAmount) => {
  if (!debtId) return;
  const debt = await DebtModelsData.findById(debtId);
  if (!debt) return;

  let oldAmt = 0;
  if (debt.debtAmount && debt.debtAmount.encryptedData && debt.debtAmount.iv) {
    try {
      const decryptedAmt = decryptData(debt.debtAmount.encryptedData, debt.debtAmount.iv);
      oldAmt = parseFloat(decryptedAmt || "0");
    } catch (e) {
      oldAmt = 0;
    }
  }

  const newAmt = oldAmt + changeAmount;
  const encAmt = encryptData(newAmt.toString());
  debt.debtAmount = encAmt;
  await debt.save();
};

// Helper: adjust goal balance
const adjustGoalBalance = async (goalId, changeAmount) => {
  if (!goalId) return;
  const goal = await GoalModelsData.findById(goalId);
  if (!goal) return;

  if (goal.type !== "money") return;

  let oldSaved = 0;
  if (goal.savedAmount && goal.savedAmount.encryptedData && goal.savedAmount.iv) {
    try {
      const decryptedSaved = decryptData(goal.savedAmount.encryptedData, goal.savedAmount.iv);
      oldSaved = parseFloat(decryptedSaved || "0");
    } catch (e) {
      oldSaved = 0;
    }
  }

  // Since changeAmount was passed as -amt * factor (where it decreases remaining),
  // our savedAmount increases by the negative of changeAmount (e.g. 0 - (-1000) = 1000)
  const newSaved = oldSaved - changeAmount;
  const encSaved = encryptData(newSaved.toString());
  goal.savedAmount = encSaved;
  await goal.save();
};

// Helper: Apply a transaction's impact to member balances and debts
const applyTransactionImpact = async (t, isReversing = false) => {
  const amt = parseFloat(safeDecrypt(t.amount) || "0");
  if (isNaN(amt) || amt === 0) return;

  // If reversing, we invert the math
  const factor = isReversing ? -1 : 1;

  if (t.type === "income") {
    // Add to source member
    await adjustMemberBalance(t.memberId, amt * factor);
  } else if (t.type === "expense") {
    // Subtract from source member
    await adjustMemberBalance(t.memberId, -amt * factor);
  } else if (t.type === "exchange") {
    // Subtract from source member, add to destination member
    await adjustMemberBalance(t.memberId, -amt * factor);
    if (t.toMemberId) {
      await adjustMemberBalance(t.toMemberId, amt * factor);
    }
  }

  // Handle Linked Debt (for income/expense only)
  if (t.others === "debt" && t.debtId) {
    // Any transaction (income or expense) linked to a debt reduces the debt amount
    await adjustDebtBalance(t.debtId, -amt * factor);
  }

  // Handle Linked Goal (for income/expense only)
  if (t.others === "goals" && t.goalId) {
    // Any transaction linked to a goal reduces the remaining goal amount
    await adjustGoalBalance(t.goalId, -amt * factor);
  }
};

// GET all transactions
export const getTransactions = async (req, res) => {
  try {
    const docs = await Transaction.find().sort({ createdAt: -1 });
    res.json(docs.map(formatTransaction));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE a new transaction
export const createTransaction = async (req, res) => {
  try {
    const {
      type,
      amount,
      memberId,
      accountId,
      toMemberId,
      toAccountId,
      others,
      debtId,
      goalId,
      category,
      note,
    } = req.body;

    if (!type || !amount || !memberId || !accountId) {
      return res
        .status(400)
        .json({ message: "type, amount, memberId and accountId are required" });
    }

    const encAmount = encryptData(amount.toString());
    const encCategory =
      others === "category" && category
        ? encryptData(category)
        : { iv: "", encryptedData: "" };
    const encNote = note ? encryptData(note) : { iv: "", encryptedData: "" };

    const doc = await Transaction.create({
      type,
      amount: encAmount,
      memberId,
      accountId,
      toMemberId: type === "exchange" ? toMemberId ?? null : null,
      toAccountId: type === "exchange" ? toAccountId ?? null : null,
      others: type === "exchange" ? "none" : others ?? "none",
      debtId: others === "debt" ? debtId ?? null : null,
      goalId: others === "goals" ? goalId ?? null : null,
      category: encCategory,
      note: encNote,
    });

    // Apply the impact of the transaction
    await applyTransactionImpact(doc, false);

    res.status(201).json({
      message: "Transaction stored successfully",
      transaction: formatTransaction(doc),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE a transaction
export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      type,
      amount,
      memberId,
      accountId,
      toMemberId,
      toAccountId,
      others,
      debtId,
      goalId,
      category,
      note,
    } = req.body;

    const oldTx = await Transaction.findById(id);
    if (!oldTx) return res.status(404).json({ message: "Transaction not found" });

    // 1. Revert old transaction impact
    await applyTransactionImpact(oldTx, true);

    // 2. Encrypt and update fields
    const encAmount = amount
      ? encryptData(amount.toString())
      : oldTx.amount;
    const encCategory =
      others === "category" && category
        ? encryptData(category)
        : { iv: "", encryptedData: "" };
    const encNote = note ? encryptData(note) : { iv: "", encryptedData: "" };

    oldTx.type = type ?? oldTx.type;
    oldTx.amount = encAmount;
    oldTx.memberId = memberId ?? oldTx.memberId;
    oldTx.accountId = accountId ?? oldTx.accountId;
    oldTx.toMemberId = type === "exchange" ? toMemberId ?? null : null;
    oldTx.toAccountId = type === "exchange" ? toAccountId ?? null : null;
    oldTx.others = type === "exchange" ? "none" : others ?? "none";
    oldTx.debtId = others === "debt" ? debtId ?? null : null;
    oldTx.goalId = others === "goals" ? goalId ?? null : null;
    oldTx.category = encCategory;
    oldTx.note = encNote;

    const updated = await oldTx.save();

    // 3. Apply new transaction impact
    await applyTransactionImpact(updated, false);

    res.json({
      message: "Transaction updated successfully",
      transaction: formatTransaction(updated),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE a transaction
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Transaction.findById(id);
    if (!doc) return res.status(404).json({ message: "Transaction not found" });

    // Revert impact before deleting
    await applyTransactionImpact(doc, true);

    await doc.deleteOne();
    res.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
