import mongoose from "mongoose";
const connectDB=async()=>{
    try{
                if (!process.env.MONGODB_URL) {
            console.log("Warning: MONGODB_URL not set. Database features will not work.");
            return;
        }
        mongoose.connection.on('connected',()=>console.log("Data base connected"))
        await mongoose.connect(`${process.env.MONGODB_URL}/quickgptt`)

    } catch(error){
        console.log(error.message);

    }

}
export default connectDB;