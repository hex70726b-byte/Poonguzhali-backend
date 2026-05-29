import { encryptData, decryptData } from "../utils/crypto.js";
import DebtModelsData from "../models/debt.js";

export const getDebt = async (req, res) => {
  try {
    const DebtData = await DebtModelsData.find();

    const decryptedDebtData = DebtData.map((_debt) => {
      let decryptedDueDate = "";
      if (_debt.dueDate && _debt.dueDate.encryptedData && _debt.dueDate.iv) {
        try {
          decryptedDueDate = decryptData(
            _debt.dueDate.encryptedData,
            _debt.dueDate.iv
          );
        } catch (e) {
          decryptedDueDate = "";
        }
      }
      return {
        _id: _debt._id,
        debtHolderName: decryptData(
          _debt.debtHolderName.encryptedData,
          _debt.debtHolderName.iv
        ),
        debtAmount: decryptData(
          _debt.debtAmount.encryptedData,
          _debt.debtAmount.iv
        ),
        dueDate: decryptedDueDate,
      };
    });

    res.json(decryptedDebtData);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const createDebt = async (req, res) => {
  try {
    const { debtHolderName, debtAmount, dueDate } = req.body;

    // Encrypt
    const encrypteddebtHolderName = encryptData(debtHolderName || "");
    const encrypteddebtAmount = encryptData(debtAmount || "0");
    const encrypteddueDate = encryptData(dueDate || "");

    const _debt = await DebtModelsData.create({
      debtHolderName: encrypteddebtHolderName,
      debtAmount: encrypteddebtAmount,
      dueDate: encrypteddueDate,
    });

    res.status(201).json({
      message: "debt stored successfully",
      _debt,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateDebt = async (req, res) => {
  try {
    const { id } = req.params;
    const { debtHolderName, debtAmount, dueDate } = req.body;

    const encrypteddebtHolderName = encryptData(debtHolderName || "");
    const encrypteddebtAmount = encryptData(debtAmount || "0");
    const encrypteddueDate = encryptData(dueDate || "");

    const updatedDebt = await DebtModelsData.findByIdAndUpdate(
      id,
      {
        debtHolderName: encrypteddebtHolderName,
        debtAmount: encrypteddebtAmount,
        dueDate: encrypteddueDate,
      },
      { new: true }
    );

    if (!updatedDebt) {
      return res.status(404).json({ message: "Debt not found" });
    }

    res.json({ message: "Debt updated successfully", debt: updatedDebt });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteDebt = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedDebt = await DebtModelsData.findByIdAndDelete(id);

    if (!deletedDebt) {
      return res.status(404).json({ message: "Debt not found" });
    }

    res.json({ message: "Debt deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
