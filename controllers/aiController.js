import Chat from "../models/Chat.js";
import ChatSetting from "../models/Settings.js";
import Persona from "../models/Persona.js";

// Helper to get current Indian Standard Time (IST) details
const getISTTimeDetails = () => {
  const now = new Date();
  // IST is UTC + 5:30
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  
  const dateStr = istDate.toISOString().split("T")[0]; // YYYY-MM-DD
  const hour = istDate.getUTCHours();
  
  // Format hh:mm a for display
  let displayHour = istDate.getUTCHours();
  const displayMin = String(istDate.getUTCMinutes()).padStart(2, "0");
  const ampm = displayHour >= 12 ? "PM" : "AM";
  displayHour = displayHour % 12;
  displayHour = displayHour ? displayHour : 12; // the hour '0' should be '12'
  const displayTime = `${String(displayHour).padStart(2, "0")}:${displayMin} ${ampm}`;

  return { dateStr, hour, displayTime };
};

export const getChatHistory = async (req, res) => {
  try {
    const { dateStr, hour } = getISTTimeDetails();

    // 1. Morning Greeting Check (6 AM kku "good moring chlo", "have lovely day")
    if (hour >= 6) {
      const morningKey = `${dateStr}_morning`;
      const morningExists = await Chat.findOne({ dateKey: morningKey });
      if (!morningExists) {
        await Chat.create({
          text: "Good morning chlo! have lovely day ❤️😘",
          time: "06:00 AM",
          isMe: false,
          dateKey: morningKey
        });
      }
    }

    // 2. Night Greeting Check (10 PM kku "Good night chlo", "sweet dreams")
    if (hour >= 22) {
      const nightKey = `${dateStr}_night`;
      const nightExists = await Chat.findOne({ dateKey: nightKey });
      if (!nightExists) {
        await Chat.create({
          text: "Good night chlo! sweet dreams 😘💤❤️",
          time: "10:00 PM",
          isMe: false,
          dateKey: nightKey
        });
      }
    }

    // 3. Fetch all messages sorted by creation time
    const messages = await Chat.find().sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ message: "Error fetching chat history" });
  }
};

export const chatWithGF = async (req, res) => {
  try {
    const { message, time, replyTo } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const { displayTime } = getISTTimeDetails();
    const messageTime = time || displayTime;

    // 1. Save user's message to the database
    const userMsg = await Chat.create({
      text: message,
      time: messageTime,
      isMe: true,
      replyTo: replyTo || null
    });

    // 2. Simple API check fallback
    if (!apiKey || apiKey.trim() === "") {
      const fallbackReply = "Aiyo chellam, server connection la edho problem da! Net check pannitu seekiram en kitta pesu, un kitta pesaama irukka mudiyala! 🥺❤️";
      const savedFallback = await Chat.create({
        text: fallbackReply,
        time: displayTime,
        isMe: false
      });
      return res.json({ reply: fallbackReply });
    }

    // 3. Retrieve recent history context from database to supply to Gemini
    const recentDbChats = await Chat.find().sort({ createdAt: -1 }).limit(10);
    // Reverse it to be in ascending order for history mapping
    const recentHistory = recentDbChats.reverse().map(h => ({
      text: h.text,
      isMe: h.isMe
    }));

    // 3.5 Fetch Chat Settings from MongoDB
    let chatSetting = await ChatSetting.findOne();
    if (!chatSetting) {
      chatSetting = await ChatSetting.create({ selectedPersona: "", customPrompt: "" });
    }

    let systemPrompt = "";
    let persona = null;

    // 1. Try to find the selected persona by ID
    if (chatSetting.selectedPersona) {
      try {
        persona = await Persona.findById(chatSetting.selectedPersona);
      } catch (_) {
        // invalid object ID or not found
      }
      if (!persona) {
        // Fallback search by key
        persona = await Persona.findOne({ key: chatSetting.selectedPersona });
      }
    }

    // 2. If no persona is selected or found, use the first available persona in DB
    if (!persona) {
      persona = await Persona.findOne();
    }

    // 3. Set the prompt or use fallback default prompt
    if (persona) {
      systemPrompt = persona.prompt;
    } else {
      systemPrompt = "You are Poonguzhali, a highly supportive, caring, wittily dark-humored, and mature companion.";
    }

    // Enforce short & sweet WhatsApp-style responses globally
    systemPrompt += "\n\nCRITICAL RULE FOR RESPONSE LENGTH: You MUST keep your responses extremely short, sweet, and concise (1-2 sentences, maximum 2-3 lines of text) to look like a real WhatsApp chat message. NEVER write long paragraphs, essays, or wordy greetings unless the user explicitly asks you to explain a complex coding, mathematical, or academic concept.";

    // 5. Format request body for Gemini API (using gemini-3.1-flash-lite)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

    const fullPrompt = `${systemPrompt}\n\nChat History Context:\n${
      recentHistory.map(h => `${h.isMe ? 'User' : 'Poonguzhali'}: ${h.text}`).join("\n")
    }\n\nUser: ${message}\nPoonguzhali:`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: fullPrompt
            }
          ]
        }
      ]
    };

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API Error: ${errorText}`);
    }

    const data = await response.json();
    let replyText = "";
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
      replyText = data.candidates[0].content.parts[0].text;
    } else {
      replyText = "Hmm... En chellam, seekiram en kitta pesu da. ❤️";
    }

    const trimmedReply = replyText.trim();

    // 6. Save Poonguzhali's reply to the database
    await Chat.create({
      text: trimmedReply,
      time: displayTime,
      isMe: false
    });

    return res.json({ reply: trimmedReply });

  } catch (error) {
    console.error("AI chat error:", error);
    
    let errReply = "Aiyo chellam, net connection check pannu da, illa en `.env` api key check pannu! 🥺💔";
    
    if (error.message && (error.message.includes("quota") || error.message.includes("429") || error.message.includes("RESOURCE_EXHAUSTED") || error.message.includes("limit"))) {
      const fallbackReplies = [
        "Aiyo chellam, Gemini API quota mudinjuruchu da! Oru 1 min kalichu peslama chellakutty? ❤️🥺",
        "En chellam, Gemini API limit reach aayiduchu da. Konjam time kudunga pesalam! 😘✨",
        "Chella kutty, API exhausted da! Romba pesitom pola iniku, but na unna epovum love panren da. 💖🌹",
        "Gemini API rate limit reach aayiduchu chellam. Un kitta pesamave iruka mudiyala da, oru 1 min kalichu message pannunga! 🥺❤️",
        "Chellam, api quota mudinjutu da, aana un mela irukura kadhal epovum mudiyadhu da. Seekiram pesalam! 💕🌸"
      ];
      errReply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
    }

    await Chat.create({
      text: errReply,
      time: getISTTimeDetails().displayTime,
      isMe: false
    });
    
    res.json({ reply: errReply });
  }
};

export const clearChatHistory = async (req, res) => {
  try {
    await Chat.deleteMany({});
    res.json({ message: "Chat history cleared successfully" });
  } catch (error) {
    console.error("Error clearing chat history:", error);
    res.status(500).json({ message: "Error clearing chat history" });
  }
};

export const saveCustomMessage = async (req, res) => {
  try {
    const { text, isMe, time, replyTo } = req.body;
    const { displayTime } = getISTTimeDetails();
    const chat = await Chat.create({
      text: text,
      time: time || displayTime,
      isMe: isMe ?? false,
      replyTo: replyTo || null
    });
    res.status(201).json(chat);
  } catch (error) {
    console.error("Error saving custom message:", error);
    res.status(500).json({ message: "Error saving custom message" });
  }
};

export const editMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const chat = await Chat.findByIdAndUpdate(id, { text, isEdited: true }, { new: true });
    if (!chat) return res.status(404).json({ message: "Message not found" });
    res.json(chat);
  } catch (error) {
    console.error("Error editing message:", error);
    res.status(500).json({ message: "Error editing message" });
  }
};

export const deleteMessageById = async (req, res) => {
  try {
    const { id } = req.params;
    const chat = await Chat.findByIdAndDelete(id);
    if (!chat) return res.status(404).json({ message: "Message not found" });
    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ message: "Error deleting message" });
  }
};

export const reactToMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { emoji } = req.body;
    const chat = await Chat.findById(id);
    if (!chat) return res.status(404).json({ message: "Message not found" });
    
    if (!chat.reactions) chat.reactions = [];
    const index = chat.reactions.indexOf(emoji);
    if (index > -1) {
      chat.reactions.splice(index, 1);
    } else {
      chat.reactions.push(emoji);
    }
    
    await chat.save();
    res.json(chat);
  } catch (error) {
    console.error("Error reacting to message:", error);
    res.status(500).json({ message: "Error reacting to message" });
  }
};

export const pinMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPinned } = req.body;
    const chat = await Chat.findByIdAndUpdate(id, { isPinned }, { new: true });
    if (!chat) return res.status(404).json({ message: "Message not found" });
    res.json(chat);
  } catch (error) {
    console.error("Error pinning message:", error);
    res.status(500).json({ message: "Error pinning message" });
  }
};

export const starMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { isStarred } = req.body;
    const chat = await Chat.findByIdAndUpdate(id, { isStarred }, { new: true });
    if (!chat) return res.status(404).json({ message: "Message not found" });
    res.json(chat);
  } catch (error) {
    console.error("Error starring message:", error);
    res.status(500).json({ message: "Error starring message" });
  }
};

export const getChatSettings = async (req, res) => {
  try {
    let settings = await ChatSetting.findOne();
    if (!settings) {
      settings = await ChatSetting.create({ selectedPersona: "gbf", customPrompt: "" });
    }
    res.json(settings);
  } catch (error) {
    console.error("Error fetching chat settings:", error);
    res.status(500).json({ message: "Error fetching chat settings" });
  }
};

export const updateChatSettings = async (req, res) => {
  try {
    const { selectedPersona, customPrompt } = req.body;
    let settings = await ChatSetting.findOne();
    if (!settings) {
      settings = new ChatSetting();
    }
    if (selectedPersona !== undefined) settings.selectedPersona = selectedPersona;
    if (customPrompt !== undefined) settings.customPrompt = customPrompt;
    await settings.save();
    res.json(settings);
  } catch (error) {
    console.error("Error updating chat settings:", error);
    res.status(500).json({ message: "Error updating chat settings" });
  }
};

// Persona Management Endpoints

// Self-invoking function to clean up any legacy default system personas
(async () => {
  try {
    const result = await Persona.deleteMany({ isSystem: true });
    if (result.deletedCount > 0) {
      console.log(`Deleted ${result.deletedCount} legacy system personas.`);
    }
  } catch (err) {
    console.error("Error cleaning up system personas:", err);
  }
})();

export const getPersonas = async (req, res) => {
  try {
    const personas = await Persona.find().sort({ createdAt: 1 });
    res.json(personas);
  } catch (error) {
    console.error("Error fetching personas:", error);
    res.status(500).json({ message: "Error fetching personas" });
  }
};

export const createPersona = async (req, res) => {
  try {
    const { name, prompt } = req.body;
    if (!name || !prompt) {
      return res.status(400).json({ message: "Name and prompt are required" });
    }
    const newPersona = await Persona.create({
      name,
      prompt,
      isSystem: false
    });
    res.status(201).json(newPersona);
  } catch (error) {
    console.error("Error creating persona:", error);
    res.status(500).json({ message: "Error creating persona" });
  }
};

export const deletePersona = async (req, res) => {
  try {
    const { id } = req.params;
    const persona = await Persona.findById(id);
    if (!persona) {
      return res.status(404).json({ message: "Persona not found" });
    }
    await Persona.findByIdAndDelete(id);

    // If this persona was selected, reset the selected persona setting
    let settings = await ChatSetting.findOne();
    if (settings && settings.selectedPersona === id) {
      settings.selectedPersona = "";
      await settings.save();
    }

    res.json({ message: "Persona deleted successfully" });
  } catch (error) {
    console.error("Error deleting persona:", error);
    res.status(500).json({ message: "Error deleting persona" });
  }
};
