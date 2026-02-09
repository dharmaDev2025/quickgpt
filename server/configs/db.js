import mongoose from "mongoose";
const connectDB=async()=>{
    try{
        mongoose.connection.on('connected',()=>console.log("Data base connected"))
        await mongoose.connect(`${process.env.MONGODB_URL}/quickgptt`)

    } catch(error){
        console.log(error.message);

    }

}
export default connectDB;