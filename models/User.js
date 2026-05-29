import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

  name: {
    iv: String,
    encryptedData: String,
  },

  email: {
    iv: String,
    encryptedData: String,
  },

  password: {
    type: String,
    required: true,
  },

}, {
  timestamps: true,
});

const User = mongoose.model("User", userSchema);

export default User;