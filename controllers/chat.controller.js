const { nanoid } = require("nanoid");
const chatSchema = require("../models/chatSchema");
const msgSchema = require("../models/messageSchema");
const messageSchema = require("../models/messageSchema");
const socket = require("socket.io-client")


const newChat = async (chatpayload) => {
    // console.log(socket.emit("wow"));
    const { id, msg } = chatpayload;
    // Find active chats for this user
    const isChatExist = await chatSchema.find({ belongsTo: id.user, isActive: true });
    let chatID = null, newChatDoc = null;

    if (isChatExist.length === 0 || id.time < Date.now() - (30 * 60 * 1000)) {
        // Create new chat document
        newChatDoc = await chatSchema.create({
            chatID: nanoid(50),  // Optional custom string id
            botID: 'MYBOT',
            belongsTo: id.user,
            isActive: true
        });
        chatID = newChatDoc._id; // Use MongoDB ObjectId for messages
    } else {
        // Use existing chat document's ObjectId
        chatID = isChatExist[0]._id;
    }

    const newMessage = await msgSchema.create({
        msgContent: msg,
        timestamp: id.time,
        senderId: id.user,
        chatID: chatID,        // Must be ObjectId if schema expects ObjectId
        fromDomain: id.theDomain
    });

    return { 'isNewChat': isChatExist.length <= 0, 'chat': newChatDoc, 'message': newMessage };

}



const fetchAllChat = async (userid) => {
    const chat = await chatSchema.find({ belongsTo: userid });
    if (chat.length === 0) {
        return [];
    }

    const chatID = chat[0]._id;

    const allMessages = await msgSchema.find({ chatID: chatID }).sort({ timestamp: 1 }).select({ timestamp: 1, msgContent: 1, senderId: 1 });
    return allMessages;
}



const newAgentChat = async (msg, senderID, chatID) => {
    const currentTime = Date.now();
    const isChatExist = await chatSchema.find({ _id: chatID, belongsTo: senderID });
    if (isChatExist) {
        const newMsg = {
            msgContent: msg,
            timestamp: currentTime,
            senderId: "Agent",
            chatID: chatID,        // Must be ObjectId if schema expects ObjectId
            fromDomain: "DashBoard"
        }
        await messageSchema.create(newMsg)
        console.log("agent message saved");

    }
}
module.exports = { newChat, newAgentChat, fetchAllChat }