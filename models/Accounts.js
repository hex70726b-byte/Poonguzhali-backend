import mongoose from "mongoose";

const accountScheme = new mongoose.Schema({

    accountName:{
        iv: {
      type: String,
      required: true,
    },

    encryptedData: {
      type: String,
      required: true,
    },
    }
}, { timestamps: true })
const Accounts = mongoose.model("Accounts", accountScheme);

export default Accounts;