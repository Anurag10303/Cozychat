import Conversation from "../models/conversation.model.js"
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socketIo/server.js";
export const sendMessage = async(req,res)=>{
    try{ 
        const {message}=req.body;
        const {id:receiverId}=req.params;
        const senderId = req.user._id;
        let conversation=await Conversation.findOne({
            members:{$all:[senderId,receiverId]}
        })
        if(!conversation){
            conversation = await Conversation.create({
                members:[senderId,receiverId],
            });
        }
            const newMessage = new Message({
                senderId,
                receiverId,
                message
            });
            if(newMessage){
                conversation.messages.push(newMessage._id);
            }
            console.log("This is inside controler",newMessage)
            console.log("This is inside controler",newMessage.message)
            await Promise.all([conversation.save(),newMessage.save()]);
            const receiverSocketId=getReceiverSocketId(receiverId);
            if(receiverSocketId){
                io.to(receiverSocketId).emit("newMessage",newMessage)
            }
            res.status(201).json({
                message:newMessage.message,
                status:"Message Sent Successfuly",
                newMessage
                
                
            })
        }

     catch(error){
        console.log(error);
        res.status(500).json({error:"Internal Server error"})
    }
}

export const getMessage = async(req,res)=> {
try{
const {id: chatUser}= req.params;
const senderId = req.user._id;
let conversation = await Conversation.findOne({
    members: {
        $all: [senderId,chatUser]
    },
}).populate("messages");
if(!conversation){
    return res.status(201).json([]);
}
const messages = conversation.messages;
res.status(201).json(messages);
} catch (error){
    console.log("ERROR IN GET MESSAGE",error);
    res.status(500).json({error:"Internal Server Error"});
}
}