import mongoose from "mongoose";

const encryptedField = {
  iv: { type: String, required: true },
  encryptedData: { type: String, required: true },
};

const transactionSchema = new mongoose.Schema(
  {
    // income | expense | exchange
    type: {
      type: String,
      enum: ["income", "expense", "exchange"],
      required: true,
    },

    amount: encryptedField,

    // Source member (required for all types)
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccountMembers",
      required: true,
    },

    // Source account (required for all types)
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Accounts",
      required: true,
    },

    // Destination member (only for exchange)
    toMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccountMembers",
      default: null,
    },

    // Destination account (only for exchange)
    toAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Accounts",
      default: null,
    },

    // others: none | debt | goals | category  (for income/expense only)
    others: {
      type: String,
      enum: ["none", "debt", "goals", "category"],
      default: "none",
    },

    // Linked debt ID (if others == debt)
    debtId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    // Linked goal ID (if others == goals)
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    // Category label (if others == category)
    category: {
      ...encryptedField,
      iv: { type: String, required: false, default: "" },
      encryptedData: { type: String, required: false, default: "" },
    },

    note: {
      ...encryptedField,
      iv: { type: String, required: false, default: "" },
      encryptedData: { type: String, required: false, default: "" },
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transactions", transactionSchema);
export default Transaction;
