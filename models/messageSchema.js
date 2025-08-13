const mongoose = require("mongoose")

const messages = new mongoose.Schema({
    msgContent: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now()
    },
    senderId: {
        type: String,
        required: true
    },
    chatID: {
        type: mongoose.Schema.ObjectId,
        ref: "Chat",
        required: true
    },
    receiverId: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        // required: true
    },
    fromDomain: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model("Message", messages)




