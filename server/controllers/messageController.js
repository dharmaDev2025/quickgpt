import Chat from "../models/Chat.js";
import User from "../models/User.js";
import openai from "../configs/openai.js";
import imagekit from "../configs/imagekit.js";
//Text-based AI Chat Message Controller
export const textMessageController=async(req,res)=>{
    try{
        const userId=req.user._id;
        if(req.user.credits<1){
            return res.json({success:false,message:"You do not have enough credit to use this feature"})
        }
        const{chatId,prompt}=req.body;
        const chat=await Chat.findOne({userId,_id:chatId})
        chat.messages.push({role:"user",content:prompt,timestamp:Date.now(),isImage:false})
        const {choices} = await openai.chat.completions.create({
    model: "gemini-3-flash-preview",
    messages: [
        {   role: "system",
            content: "You are a helpful assistant." 
        },
        {
            role: "user",
            content: prompt,
        },
    ],
});
const reply={...choices[0].message,timestamp:Date.now(),isImage:false}
res.json({success:true,reply})

chat.messages.push(reply)
await chat.save();
await User.updateOne({_id:userId},{$inc:{credit:-1}})
res.json({success:true,reply})

    }catch(error){
        res.json({success:false,message:error.message})

    }

}
//Image Generation Message Controller
export const imageMessageController=async(req,res)=>{
    try{
        const userId=req.user._id;
        //Check credits
        if(req.user.credits<2){
            return res.json({success:false,message:"You donot have enough credits to use this feature"})
        }
        const{prompt,chatId,isPublished}=req.body;
        //find chat
        const chat=await Chat.findOne({userId,_id:chatId})
        //Push user messagechat
        chat.messages.push({role:"user",content:prompt,timestamp:Date.now(),isImage:false});
        //ENcode the prompt
        const encodedPrompt=encodeURIComponent(prompt)
        //construct ImageKit AI generation  URL
        const generatedImageUrl=`${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt${encodedPrompt}/quickgpt/${Date.now()}.png?tr=w=800,h-800`;
        const aiImageResponse= await axios.get(generatedImageUrl,{responseType:"arraybuffer"})
        //convert tobase 64
        const base64Image=`data:image/png;base64,${Buffer.from(aiImageResponse.data,"binary").toString('base64')}`;
        //UPLOAD IMAGEKIT TO MEDIA LIBRAY
        const uploadResponse=await imagekit.upload({
            file:base64Image,
            fileName:`${Date.now()}.png`,
            folder:"quickgpt"
        })
        const reply={
            role:'assistant',
            content:uploadResponse.url,
            timestamp:Date.now(),
            isImage:true,
            isPublished
        }
        res.json({success:true,reply})
        chat.messages.push(reply)
        await chat.save();

        await User.updateOne({_id:userId},{$inc:{credits:-2}})






    }catch(error){
        res.json({
            success:false,message:error.message
        })


    }
}