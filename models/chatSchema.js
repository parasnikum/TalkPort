const mongoose = require("mongoose")
const { modelName } = require("./botSchema")

const chat = new mongoose.Schema({
    chatID: {
        type: String,
        required: true
    },
    botID: {
        type: String,
        required: true
    },
    belongsTo: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    isActive: {
        type: Boolean,
        default: true,
    }
})




module.exports = mongoose.model("Chat", chat)