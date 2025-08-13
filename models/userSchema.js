const mongoose = require("mongoose")

const user = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type : String,
        required: true,
    },
    avtar : {
        type: String,
    },
    email: {
        type:String,
        required:true
    },
    contact : {
        type : String , 
    }
})

module.exports = mongoose.model("User", user)




