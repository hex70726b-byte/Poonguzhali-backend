import mongoose from "mongoose";

const debtScheme = new mongoose.Schema({

    debtHolderName:{
        iv: {
      type: String,
      required: true,
    },

    encryptedData: {
      type: String,
      required: true,
    },
    },
    debtAmount: {
        iv: {
      type: String,
      required: true,
    },

    encryptedData: {
      type: String,
      required: true,
    },
    },
    dueDate: {
      iv: {
        type: String,
      },
      encryptedData: {
        type: String,
      },
    }
}, { timestamps: true })
const debt = mongoose.model("Debt", debtScheme);

export default debt;