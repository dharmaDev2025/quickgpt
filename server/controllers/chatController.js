import Chat from "../models/Chat.js";

// API Controller for creating new chat
export const createChat = async (req, res) => {
    try {
        const userId = req.user._id;
        const chatData = {
            userId,
            messages: [],
            name: "New Chat",
            userName: req.user.name
        };
        const newChat = await Chat.create(chatData);  // ✅ Fixed: Capture created chat
        res.json({ success: true, message: "Chat created", chat: newChat });  // ✅ Added: Return the chat object
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// API Controller for getting all chats
export const getChats = async (req, res) => {
    try {
        const userId = req.user._id;
        const chats = await Chat.find({ userId }).sort({ updatedAt: -1 });  // ✅ Fixed: Correct sort syntax and return chats
        res.json({ success: true, chats });  // ✅ Fixed: Return chats array
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// API for deleting the chat
export const deleteChat = async (req, res) => {
    try {
        const userId = req.user._id;
        const { chatId } = req.body;
        await Chat.deleteOne({ _id: chatId, userId });
        res.json({ success: true, message: "Chat Deleted" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};