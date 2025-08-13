const mongoose = require("mongoose")
const connect = async () => {
    await mongoose.connect("mongodb://localhost:27017/chatapp").then(() => {
        console.log("DB connected");

    }).catch((err) => {
        console.log("Error: ", err);
    })
}

module.exports = { connect };