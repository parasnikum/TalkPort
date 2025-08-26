const mongoose = require("mongoose")

const bot = new mongoose.Schema({
    createdBy: {
        // type: mongoose.Schema.Types.ObjectId,
        // ref: "User",
        type : String,
        required: true
    },
    whitelist: {
        type: Boolean,
        default: false
    },
    allowedDomains: {
        type: [String],
    },
    disallowedDomains: {
        type: [String],
    },
    uniqueBotId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    avtar: {
        type: String,
        required: true
    },
    preQuestions: {
        type: [String],
        max: 5
    },
    color: {
        type: String,
        default: "#000000"
    },
    status: {
        type: String,
        default: "Enable",
    },
    greetingMessage: {
        type: String,
        default: "Hello! We are here to help you.",
    },


})




module.exports = mongoose.model("Bot", bot);