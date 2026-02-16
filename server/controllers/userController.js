import bcrypt from "bcryptjs";
import User from "../models/User.js";
import jwt from 'jsonwebtoken';
import Chat from "../models/Chat.js"; // Chat model contains messages

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// API TO REGISTER USER
export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.json({ success: false, message: "User already exists" });
        }

        const user = await User.create({ name, email, password });
        const token = generateToken(user._id);
        res.json({ success: true, token });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// API TO LOGIN USER
export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                const token = generateToken(user._id);
                return res.json({ success: true, token });
            }
        }
        return res.json({ success: false, message: "Invalid email or password" });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// API to get user data
export const getUser = async (req, res) => {
    try {
        const user = req.user;
        return res.json({ success: true, user });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// API TO GET PUBLISHED IMAGES
export const getPublishedImages = async (req, res) => {
    try {
        const publishedImageMessages = await Chat.aggregate([
            { $unwind: "$messages" }, // Flatten messages array
            {
                $match: {
                    "messages.isImage": true,
                    "messages.isPublished": true
                }
            },
            // Join with User collection to get username
            {
                $lookup: {
                    from: "users",         // Collection name in MongoDB
                    localField: "userId",  // Field in Chat
                    foreignField: "_id",   // Field in User
                    as: "user"
                }
            },
            { $unwind: "$user" }, // Flatten user array
            {
                $project: {
                    _id: 0,
                    imageUrl: "$messages.content",
                    userName: "$user.name"
                }
            },
            { $sort: { "messages.timestamp": -1 } } // Latest images first
        ]);

        return res.json({ success: true, images: publishedImageMessages });
    } catch (error) {
        console.error("Get Published Images Error:", error);
        return res.json({ success: false, message: error.message });
    }
};
