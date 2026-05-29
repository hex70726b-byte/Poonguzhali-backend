import { encryptData, decryptData } from "../utils/crypto.js";
import LearningModelsData from "../models/Learnings.js";

const safeDecrypt = (field) => {
  if (!field || !field.encryptedData || !field.iv) return "";
  try {
    return decryptData(field.encryptedData, field.iv);
  } catch (e) {
    return "";
  }
};

const safeEncrypt = (val) => {
  return encryptData(val || "");
};

export const getLearnings = async (req, res) => {
  try {
    const learnings = await LearningModelsData.find().sort({ createdAt: -1 });

    const decrypted = learnings.map((l) => ({
      _id: l._id,
      learningTopic: safeDecrypt(l.learningTopic),
      content: safeDecrypt(l.content),
      links: safeDecrypt(l.links),
      createdAt: l.createdAt,
      updatedAt: l.updatedAt,
    }));

    res.json(decrypted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createLearning = async (req, res) => {
  try {
    const { learningTopic, content, links } = req.body;

    if (!learningTopic) {
      return res.status(400).json({ message: "learningTopic is required" });
    }

    const learning = await LearningModelsData.create({
      learningTopic: safeEncrypt(learningTopic),
      content: safeEncrypt(content),
      links: safeEncrypt(links || "[]"),
    });

    res.status(201).json({
      message: "Learning stored successfully",
      learning: {
        _id: learning._id,
        learningTopic,
        content,
        links,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateLearning = async (req, res) => {
  try {
    const { id } = req.params;
    const { learningTopic, content, links } = req.body;

    const learning = await LearningModelsData.findById(id);
    if (!learning) {
      return res.status(404).json({ message: "Learning not found" });
    }

    if (learningTopic !== undefined) learning.learningTopic = safeEncrypt(learningTopic);
    if (content !== undefined) learning.content = safeEncrypt(content);
    if (links !== undefined) learning.links = safeEncrypt(links);

    await learning.save();

    res.json({
      message: "Learning updated successfully",
      learning: {
        _id: learning._id,
        learningTopic: learningTopic || safeDecrypt(learning.learningTopic),
        content: content || safeDecrypt(learning.content),
        links: links || safeDecrypt(learning.links),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteLearning = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await LearningModelsData.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Learning not found" });
    }

    res.json({ message: "Learning deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
