import Chat from "../models/Chat.js";
import User from "../models/User.js";
import openai from "../configs/openai.js";
import imagekit from "../configs/imagekit.js";
import axios from "axios";


// ===============================
// TEXT MESSAGE CONTROLLER
// ===============================
export const textMessageController = async (req, res) => {
    try {

        const userId = req.user._id;

        // check credits
        if (req.user.credits < 1) {
            return res.json({
                success: false,
                message: "You do not have enough credits"
            });
        }

        const { chatId, prompt } = req.body;

        const chat = await Chat.findOne({ userId, _id: chatId });

        if (!chat) {
            return res.json({ success: false, message: "Chat not found" });
        }

        // store user message
        const userMessage = {
            role: "user",
            content: prompt,
            timestamp: Date.now(),
            isImage: false
        };

        chat.messages.push(userMessage);

        // ✅ FIXED OPENAI MODEL HERE
        const completion = await openai.chat.completions.create({
            model: "gpt-4.1-mini",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: prompt }
            ],
        });

        const reply = {
            role: "assistant",
            content: completion.choices[0].message.content,
            timestamp: Date.now(),
            isImage: false
        };

        chat.messages.push(reply);

        await chat.save();

        // deduct credit
        await User.updateOne(
            { _id: userId },
            { $inc: { credits: -1 } }
        );

        res.json({ success: true, reply });

    } catch (error) {

        console.error("TEXT ERROR:", error);

        res.json({
            success: false,
            message: error.message
        });
    }
};



// ===============================
// IMAGE MESSAGE CONTROLLER
// ===============================
export const imageMessageController = async (req, res) => {

    try {

        const userId = req.user._id;

        if (req.user.credits < 2) {
            return res.json({
                success: false,
                message: "You do not have enough credits"
            });
        }

        const { prompt, chatId, isPublished } = req.body;

        const chat = await Chat.findOne({ userId, _id: chatId });

        if (!chat) {
            return res.json({ success: false, message: "Chat not found" });
        }

        // store user message
        chat.messages.push({
            role: "user",
            content: prompt,
            timestamp: Date.now(),
            isImage: false
        });

        // generate image URL
        const encodedPrompt = encodeURIComponent(prompt);

        const generatedImageUrl =
            `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt${encodedPrompt}/quickgpt/${Date.now()}.png?tr=w-800,h-800`;

        const aiImageResponse = await axios.get(
            generatedImageUrl,
            { responseType: "arraybuffer" }
        );

        const base64Image =
            `data:image/png;base64,${Buffer.from(aiImageResponse.data,"binary").toString("base64")}`;

        const uploadResponse = await imagekit.upload({
            file: base64Image,
            fileName: `${Date.now()}.png`,
            folder: "quickgpt"
        });

        const reply = {
            role: "assistant",
            content: uploadResponse.url,
            timestamp: Date.now(),
            isImage: true,
            isPublished
        };

        chat.messages.push(reply);

        await chat.save();

        await User.updateOne(
            { _id: userId },
            { $inc: { credits: -2 } }
        );

        res.json({ success: true, reply });

    } catch (error) {

        console.error("IMAGE ERROR:", error);

        res.json({
            success: false,
            message: error.message
        });
    }
};
