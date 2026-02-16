import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import path from "path";
import { fileURLToPath } from "url";

import connectDB from './configs/db.js';
import userRouter from './routes/userRoute.js';
import chatRouter from './routes/chatRoute.js';
import messageRouter from './routes/messageRoute.js';
import creditRouter from './routes/creditRoute.js';
import { stripeWebhooks } from './controllers/webhooks.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1️⃣ Connect to MongoDB
await connectDB();

// 2️⃣ Middleware
app.use(cors());
app.use(express.json());

// 3️⃣ Stripe Webhook (raw body required)
app.post('/api/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

// 4️⃣ Routes
app.use('/api/user', userRouter);
app.use('/api/chat', chatRouter);
app.use('/api/message', messageRouter);
app.use('/api/credit', creditRouter);

// Serve frontend
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));

app.use((req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
});

// 5️⃣ Start server
const PORT = process.env.PORT || 3000;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

app.listen(PORT, HOST, () => {
    console.log(`Server is running on port ${PORT}`);
});
