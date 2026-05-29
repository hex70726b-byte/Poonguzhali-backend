const mongoose = require("mongoose");
const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const { decryptData } = require("./utils/crypto");
const HabitModelsData = require("./models/Habits").default;

const MONGO_URI = "mongodb+srv://hex70726b:Userhex@cluster0.eyoff8l.mongodb.net/personal_agent";

async function queryHabits() {
  await mongoose.connect(MONGO_URI);
  try {
    const habits = await HabitModelsData.find();
    console.log(`Found ${habits.length} habits in the database:`);
    for (let h of habits) {
      console.log(`-----------------------------------`);
      console.log(`ID: ${h._id}`);
      console.log(`Name (Decrypted): ${decryptData(h.habitName.encryptedData, h.habitName.iv)}`);
      console.log(`Type: ${h.type}`);
      if (h.gap && h.gap.encryptedData) {
        console.log(`Gap (Decrypted): "${decryptData(h.gap.encryptedData, h.gap.iv)}"`);
      } else {
        console.log(`Gap: No Gap Field`);
      }
      if (h.startingTime && h.startingTime.encryptedData) {
        console.log(`Starting (Decrypted): "${decryptData(h.startingTime.encryptedData, h.startingTime.iv)}"`);
      }
      if (h.endingTime && h.endingTime.encryptedData) {
        console.log(`Ending (Decrypted): "${decryptData(h.endingTime.encryptedData, h.endingTime.iv)}"`);
      }
    }
  } catch (err) {
    console.error("Error querying:", err);
  } finally {
    await mongoose.disconnect();
  }
}

queryHabits();
