import axios from 'axios';
import Chat from "../models/Chat.js";
import User from '../models/User.js';
import openai from "../configs/openai.js";
import imagekit from "../configs/imagekit.js";

// ===============================
// TEXT MESSAGE CONTROLLER
// ===============================
export const textMessageController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatId, prompt } = req.body;

    if (!prompt) return res.status(400).json({ success: false, message: "Prompt is required" });

    const chat = await Chat.findOne({ userId, _id: chatId });
    if (!chat) return res.status(404).json({ success: false, message: "Chat not found" });

    // Push user message
    chat.messages.push({
      role: 'user',
      content: prompt,
      timestamp: Date.now(),
      isImage: false
    });

    // OpenAI Gemini API call
    let aiText = "";
    try {
      const response = await openai.chat.completions.create({
        model: "gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: prompt },
        ],
      });

      aiText = response.choices[0].message.content || "No response from AI";

    } catch (err) {
      console.log("Gemini failed → demo mode:", err.message);
      aiText = "AI temporary busy. Demo reply: " + prompt;
    }

    const reply = {
      role: 'assistant',
      content: aiText,
      timestamp: Date.now(),
      isImage: false
    };

    chat.messages.push(reply);
    await chat.save();

    // Deduct credits if needed
    await User.updateOne({ _id: userId }, { $inc: { credits: -1 } });

    return res.json({ success: true, reply });

  } catch (error) {
    console.error("Text Chat Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ===============================
// IMAGE MESSAGE CONTROLLER
// ===============================
export const imageMessageController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatId, prompt } = req.body;

    if (!prompt || !chatId) return res.status(400).json({ success: false, message: "Prompt and Chat ID are required" });

    const chat = await Chat.findOne({ userId, _id: chatId });
    if (!chat) return res.status(404).json({ success: false, message: "Chat not found" });

    // Push user prompt
    chat.messages.push({
      role: 'user',
      content: prompt,
      timestamp: Date.now(),
      isImage: false
    });

    // Generate image via ImageKit
    const encodedPrompt = encodeURIComponent(prompt);
    const generatedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/quickgpt/${Date.now()}.png?tr=w-800,h-800`;

    const aiImageResponse = await axios.get(generatedImageUrl, { responseType: 'arraybuffer' });
    const base64Image = `data:image/png;base64,${Buffer.from(aiImageResponse.data, 'binary').toString('base64')}`;

    const uploadResponse = await imagekit.upload({
      file: base64Image,
      fileName: `ai_gen_${Date.now()}.png`,
      folder: "quickgpt"
    });

    const reply = {
      role: 'assistant',
      content: uploadResponse.url,
      timestamp: Date.now(),
      isImage: true
    };

    chat.messages.push(reply);
    await chat.save();

    // Deduct credits if needed
    await User.updateOne({ _id: userId }, { $inc: { credits: -2 } });

    return res.json({ success: true, reply });

  } catch (error) {
    console.error("Image Gen Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to generate image" });
  }
};

// ===============================
// COMMUNITY / PUBLISHED IMAGES CONTROLLER
// ===============================
export const getPublishedImages = async (req, res) => {
  try {
    const images = await Chat.find({ 'messages.isImage': true })
      .sort({ 'messages.timestamp': -1 })
      .limit(50)
      .select('messages userId')
      .lean();

    const formattedImages = images.flatMap(chat =>
      chat.messages
        .filter(m => m.isImage)
        .map(m => ({
          imageUrl: m.content,
          userName: chat.userId // Replace with actual username if populated
        }))
    );

    return res.json({ success: true, images: formattedImages });

  } catch (error) {
    console.error("Fetch Published Images Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
