import Chat from "../models/Chat.js";
import User from "../models/User.js";
import openai from "../configs/openai.js";
import imagekit from "../configs/imagekit.js";
import axios from "axios";  // ✅ Added: Import axios for image generation

// Text-based AI Chat Message Controller
export const textMessageController = async (req, res) => {
    try {
        const userId = req.user._id;
        if (req.user.credits < 1) {
            return res.json({ success: false, message: "You do not have enough credits to use this feature" });
        }
        const { chatId, prompt } = req.body;
        const chat = await Chat.findOne({ userId, _id: chatId });
        if (!chat) {
            return res.json({ success: false, message: "Chat not found" });
        }

        // Push user message
        chat.messages.push({ role: "user", content: prompt, timestamp: Date.now(), isImage: false });

        // Generate AI reply
        const { choices } = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",  // ✅ Fixed: Use a valid OpenAI model (not "gemini-3-flash-preview", which isn't OpenAI)
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: prompt },
            ],
        });
        const reply = { ...choices[0].message, timestamp: Date.now(), isImage: false };

        // Push reply and save to DB
        chat.messages.push(reply);
        await chat.save();

        // Deduct credits
        await User.updateOne({ _id: userId }, { $inc: { credits: -1 } });

        // ✅ Fixed: Send response only once, after saving
        res.json({ success: true, reply });
    } catch (error) {
        console.error("Error in textMessageController:", error);  // ✅ Added: Logging for debugging
        res.json({ success: false, message: error.message });
    }
};

// Image Generation Message Controller
export const imageMessageController = async (req, res) => {
    try {
        const userId = req.user._id;
        if (req.user.credits < 2) {
            return res.json({ success: false, message: "You do not have enough credits to use this feature" });
        }
        const { prompt, chatId, isPublished } = req.body;
        const chat = await Chat.findOne({ userId, _id: chatId });
        if (!chat) {
            return res.json({ success: false, message: "Chat not found" });
        }

        // Push user message
        chat.messages.push({ role: "user", content: prompt, timestamp: Date.now(), isImage: false });

        // Generate image (using ImageKit as per your code)
        const encodedPrompt = encodeURIComponent(prompt);
        const generatedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt${encodedPrompt}/quickgpt/${Date.now()}.png?tr=w-800,h-800`;  // ✅ Fixed: Corrected URL syntax
        const aiImageResponse = await axios.get(generatedImageUrl, { responseType: "arraybuffer" });
        const base64Image = `data:image/png;base64,${Buffer.from(aiImageResponse.data, "binary").toString('base64')}`;

        // Upload to ImageKit
        const uploadResponse = await imagekit.upload({
            file: base64Image,
            fileName: `${Date.now()}.png`,
            folder: "quickgpt"
        });

        const reply = {
            role: 'assistant',
            content: uploadResponse.url,
            timestamp: Date.now(),
            isImage: true,
            isPublished
        };

        // Push reply and save to DB
        chat.messages.push(reply);
        await chat.save();

        // Deduct credits
        await User.updateOne({ _id: userId }, { $inc: { credits: -2 } });

        // ✅ Fixed: Send response only once, after saving
        res.json({ success: true, reply });
    } catch (error) {
        console.error("Error in imageMessageController:", error);  // ✅ Added: Logging for debugging
        res.json({ success: false, message: error.message });
    }
};