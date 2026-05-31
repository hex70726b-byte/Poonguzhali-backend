import mongoose from "mongoose";

const ChatSettingSchema = new mongoose.Schema({
  selectedPersona: {
    type: String,
    enum: ["gbf", "romantic_gf", "possessive_gf", "mentor", "custom"],
    default: "gbf"
  },
  customPrompt: {
    type: String,
    default: ""
  }
}, { timestamps: true });

export default mongoose.model("ChatSetting", ChatSettingSchema);
