import mongoose from "mongoose";

const accountMemberScheme = new mongoose.Schema({

   AccountMemberName:{
         iv: {
      type: String,
      required: true,
    },

    encryptedData: {
      type: String,
      required: true,
    },
    },
    Amount:{
        iv: {
      type: String,
      required: true,
    },

    encryptedData: {
      type: String,
      required: true,
    },
    },
    AccountId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
}, { timestamps: true })
const AccountMembers = mongoose.model("AccountMembers", accountMemberScheme);

export default AccountMembers;