const mongoose = require("mongoose");
const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const Schema = mongoose.Schema;
const ChatSchema = new Schema({
  text: String,
  time: String,
  isMe: Boolean,
  replyTo: String,
  isPinned: { type: Boolean, default: false },
  isEdited: { type: Boolean, default: false },
  reactions: [String],
  dateKey: String
}, { timestamps: true });

const Chat = mongoose.models.Chat || mongoose.model("Chat", ChatSchema);

const MONGO_URI = "mongodb+srv://hex70726b:Userhex@cluster0.eyoff8l.mongodb.net/personal_agent";

async function queryChats() {
  await mongoose.connect(MONGO_URI);
  try {
    const chats = await Chat.find().sort({ createdAt: -1 }).limit(30);
    console.log(`\n--- LATEST 30 CHAT MESSAGES ---`);
    for (let c of chats.reverse()) {
      console.log(`[${c.createdAt.toISOString()}] [isMe: ${c.isMe}] "${c.text}" (time: ${c.time})`);
    }
  } catch (err) {
    console.error("Error querying chats:", err);
  } finally {
    await mongoose.disconnect();
  }
}

queryChats();
