import bcrypt from "bcrypt"
import {encryptData, decryptData} from "../utils/crypto.js"
import User from "../models/User.js";

export const getUsers = async (req, res) => {
  try {
    const users = await User.find();

    const decryptedUsers = users.map((user) => ({
      _id: user._id,

      name: decryptData(
        user.name.encryptedData,
        user.name.iv
      ),

      email: decryptData(
        user.email.encryptedData,
        user.email.iv
      ),
    }));

    res.json(decryptedUsers);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


export const registerUsers = async (req, res) => {
  try{
  const { name, email, password } = req.body;

  //bcrypt
  const saltRounds = 10;
  const hashedpassword = await bcrypt.hash(password, saltRounds)

  const isMatch = await bcrypt.compare(password, hashedpassword)

  // Encrypt
  const encryptedName = encryptData(name);
  const encryptedEmail = encryptData(email);

  const user = await User.create({
    name: encryptedName,
    email: encryptedEmail,
    password: hashedpassword
  })

  // Decrypt
  const decryptedName = decryptData(
    encryptedName.encryptedData,
    encryptedName.iv
  );

  const decryptedEmail = decryptData(
    encryptedEmail.encryptedData,
    encryptedEmail.iv
  );

  res.status(201).json({
    message:"User stored successfully",
    user,
  });

  } catch(error){
    res.status(500).json({
      message: error.message,
    })
  }
};

