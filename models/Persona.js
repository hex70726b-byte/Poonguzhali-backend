import mongoose from "mongoose";

const PersonaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  key: {
    type: String, // For system default personas, e.g. "gbf", "romantic_gf"
    default: null
  },
  prompt: {
    type: String,
    required: true
  },
  isSystem: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model("Persona", PersonaSchema);
