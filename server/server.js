import express from 'express'
import  'dotenv/config'
import cors from 'cors'
import connectDB from './configs/db.js';
import userRouter from './routes/userRoute.js';
import chatRouter from './routes/chatRoute.js';
import messageRouter from './routes/messageRoute.js';
import creditRouter from './routes/creditRoute.js';

const app=express();
await connectDB();
//Stripe Webhoks
app.post('/api/stripe',express.raw({type}))
//middlwware
app.use(cors())
app.use(express.json())

//Routes
app.get('/',(req,res)=>res.send("server is live"))
app.use('/api/user',userRouter)
app.use('/api/chat',chatRouter)
app.use('/api/message',messageRouter)
app.use('/api/credit',creditRouter)
const PORT=process.env.PORT||3000
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)

})