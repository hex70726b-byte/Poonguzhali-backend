import { encryptData, decryptData } from "../utils/crypto.js"
import AccountMembersModelsData from "../models/accountMembers.js";

// GET all account members (Decrypted)
export const getAccountMembers = async (req, res) => {
  try {
    const AccountMembersData = await AccountMembersModelsData.find();

    const decryptedAccountMembersData = AccountMembersData.map((_accountMembers) => ({
      _id: _accountMembers._id,
      AccountMemberName: decryptData(
        _accountMembers.AccountMemberName.encryptedData,
        _accountMembers.AccountMemberName.iv
      ),
      Amount: decryptData(
        _accountMembers.Amount.encryptedData,
        _accountMembers.Amount.iv
      ),
      AccountId: _accountMembers.AccountId,
    }));

    res.json(decryptedAccountMembersData);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// CREATE a new account member
export const createAccountMembers = async (req, res) => {
  try {
    const { AccountMemberName, Amount, AccountId } = req.body;
    if (!AccountMemberName || !Amount || !AccountId) {
      return res.status(400).json({ message: "AccountMemberName, Amount, and AccountId are required" });
    }

    // Encrypt
    const encryptedAccountMemberName = encryptData(AccountMemberName);
    const encryptedAmount = encryptData(Amount);

    const _accountMembers = await AccountMembersModelsData.create({
      AccountMemberName: encryptedAccountMemberName,
      Amount: encryptedAmount,
      AccountId,
    });

    res.status(201).json({
      message: "Member stored successfully",
      _accountMembers: {
        _id: _accountMembers._id,
        AccountMemberName,
        Amount,
        AccountId,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE an existing account member
export const updateAccountMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const { AccountMemberName, Amount } = req.body;

    if (!AccountMemberName || !Amount) {
      return res.status(400).json({ message: "AccountMemberName and Amount are required" });
    }

    // Encrypt new data
    const encryptedAccountMemberName = encryptData(AccountMemberName);
    const encryptedAmount = encryptData(Amount);

    const updatedMember = await AccountMembersModelsData.findByIdAndUpdate(
      id,
      {
        AccountMemberName: encryptedAccountMemberName,
        Amount: encryptedAmount,
      },
      { new: true }
    );

    if (!updatedMember) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.json({
      message: "Member updated successfully",
      _accountMembers: {
        _id: updatedMember._id,
        AccountMemberName,
        Amount,
        AccountId: updatedMember.AccountId,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE an account member
export const deleteAccountMembers = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedMember = await AccountMembersModelsData.findByIdAndDelete(id);

    if (!deletedMember) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.json({
      message: "Member deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
