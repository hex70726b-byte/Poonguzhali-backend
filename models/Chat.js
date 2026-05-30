import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({
  text: { type: String, required: true },
  time: { type: String, required: true },
  isMe: { type: Boolean, required: true },
  dateKey: { type: String },
  reactions: { type: [String], default: [] },
  replyTo: { type: String, default: null },
  isPinned: { type: Boolean, default: false },
  isEdited: { type: Boolean, default: false },
  isStarred: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Chat", ChatSchema);
