import mongoose from "mongoose";

const ChatSettingSchema = new mongoose.Schema({
  selectedPersona: {
    type: String,
    default: "gbf"
  },
  customPrompt: {
    type: String,
    default: ""
  }
}, { timestamps: true });

export default mongoose.model("ChatSetting", ChatSettingSchema);
