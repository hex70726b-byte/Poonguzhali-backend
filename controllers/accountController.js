import bcrypt from "bcrypt"
import { encryptData, decryptData } from "../utils/crypto.js"
import AccountModelsData from "../models/Accounts.js";
import AccountMembersModelsData from "../models/accountMembers.js";

// GET all accounts (Decrypted)
export const getAccounts = async (req, res) => {
  try {
    const AccountData = await AccountModelsData.find();

    const decryptedAccountData = AccountData.map((_account) => ({
      _id: _account._id,
      accountName: decryptData(
        _account.accountName.encryptedData,
        _account.accountName.iv
      ),
    }));

    res.json(decryptedAccountData);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// CREATE a new account
export const createAccounts = async (req, res) => {
  try {
    const { accountName } = req.body;
    if (!accountName) {
      return res.status(400).json({ message: "accountName is required" });
    }

    // Encrypt
    const encryptedAccountName = encryptData(accountName);

    const _account = await AccountModelsData.create({
      accountName: encryptedAccountName
    });

    res.status(201).json({
      message: "Account stored successfully",
      _account: {
        _id: _account._id,
        accountName: accountName,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE an existing account
export const updateAccounts = async (req, res) => {
  try {
    const { id } = req.params;
    const { accountName } = req.body;

    if (!accountName) {
      return res.status(400).json({ message: "accountName is required" });
    }

    // Encrypt new account name
    const encryptedAccountName = encryptData(accountName);

    const updatedAccount = await AccountModelsData.findByIdAndUpdate(
      id,
      { accountName: encryptedAccountName },
      { new: true }
    );

    if (!updatedAccount) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.json({
      message: "Account updated successfully",
      _account: {
        _id: updatedAccount._id,
        accountName: accountName,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE an account (and its associated members/balances)
export const deleteAccounts = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedAccount = await AccountModelsData.findByIdAndDelete(id);

    if (!deletedAccount) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Delete all linked members under this account
    await AccountMembersModelsData.deleteMany({ AccountId: id });

    res.json({
      message: "Account and its associated members deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
