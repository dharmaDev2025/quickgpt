import Chat from "../models/Chat.js";
//API Controller for creating new chat
export const createChat=async(req,res)=>{
    try{
        const userId=req.user._id;
        const chatData={
            userId,
            messages:[],
            name:"New Chat",
            userName:req.user.name
        }
        await Chat.create(chatData)
        res.json({success:true,message:"chat created"})

    }
    catch(error){
        res.json({success:false,message:error.message})

    }
}
//API CONTROLLER FOR GETTING ALL CHATS
export const getChats=async(req,res)=>{
    try{
        const userId=req.user._id;
        const chats=await Chat.find({userId}.sort({updatedAt:-1}))
        res.json({success:true,message:"Chat created"})

    }
    catch(error){
        res.json({success:false,message:error.message})

    }

}
//API FOR DELETING THE CHAT
export const deleteChat=async(req,res)=>{
    try{
     const userId=req.user._id
     const{chatId}=req.body;
     await Chat.deleteOne({_id:chatId,userId})
     res.json({success:true,message:"Chat Deleted"})

    }
    catch(error){
        res.json({success:false,message:error.message})
    }
}