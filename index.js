const express = require("express");
const fs = require("fs");
const app = express();
const http = require("http").Server(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*",  // allow your frontend origin here
        methods: ["GET", "POST"]
    }
});
const cookieParser = require('cookie-parser');
const db = require("./db");
const { nanoid } = require("nanoid");
const { newChat, newAgentChat, fetchAllChat } = require("./controllers/chat.controller");
const chatSchema = require("./models/chatSchema");
const path = require("path");
const adminRoutes = require("./routes/admin.routes")
const cors = require("cors");
const botSchema = require("./models/botSchema");


let socketData = new Object();


db.connect();
app.use(cors({
    origin: "*", // or specific domains like ["https://client.com"]
    credentials: true
}));
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "/views"));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))



app.use(cookieParser());
app.use("/admin", adminRoutes)
app.use(express.static('public'));

app.get("/", async (req, res) => {

    // Always generate a new ID only if no cookie exists
    // console.log("check kookie",JSON.parse(req.cookies.id).user);
    const now = Date.now();
    let cookie = null;
    if (req.cookies) {
        try {
            cookie = JSON.parse(req.cookies.id);
        } catch {
            cookie = null; // fallback on parse error
        }
    }
    // const cookie = req.cookies ? JSON.parse(req.cookies.id) : null
    let id = req.cookies ? cookie?.user : null
    if (!cookie || (cookie.time + (1000 * 60 * 30) < now)) {
        id = await nanoid(90);
        const host = req.host;
        const newCookie = {
            user: id,
            time: now,
            theDomain: host,
        };
        res.cookie("id", JSON.stringify(newCookie), { maxAge: 120 * 24 * 60 * 60 * 1000 });
    }
    else {
        // const userid = JSON.parse(req.cookies.id).user;
        // const allMesg = await fetchAllChat(userid)
        // console.log("Exist cookie " + JSON.parse(req.cookies.id).user,);
        const host = req.host;
        const newCookie = {
            user: id,
            time: now,
            theDomain: host,
        };
        res.cookie("id", JSON.stringify(newCookie), {
            maxAge: 120 * 24 * 60 * 60 * 1000, // 120 days
            sameSite: "none",
            secure: true, // required for SameSite=None to work
        });
        // res.cookie("id", JSON.stringify(newCookie), { maxAge: 120 * 24 * 60 * 60 * 1000 });
    }
    // console.log("Cookies:", req.cookies);
    // res.send("Hello from root route")
    res.sendFile(__dirname + "/views/chatbot/index.html");
});


app.get("/:widgetid/widget.js", async (req, res) => {
    const { widgetid } = req.params;
    const isWidgetFound = await botSchema.findOne({ uniqueBotId: widgetid });

    if (!isWidgetFound) {
        return res.send("widget id is wrong")
    }
    const widgetLoaderPath = path.join(__dirname, "views", "widget.js");
    res.set("Content-Type", "application/javascript");

    const now = Date.now();
    let cookie = null;

    try {
        if (req.cookies?.id) {
            cookie = JSON.parse(req.cookies.id);
        }
    } catch (e) {
        cookie = null;
    }

    let id = cookie?.user || null;

    // Always reset cookie if it's missing or expired
    const shouldReset = !cookie || (cookie.time + 1000 * 60 * 30 < now);
    if (shouldReset) {
        id = await nanoid(90);
    }

    const newCookie = {
        user: id,
        time: now,
        theDomain: req.hostname,
    };

    // ✅ Always set with SameSite=None and Secure for cross-domain usage
    res.cookie("id", JSON.stringify(newCookie), {
        maxAge: 120 * 24 * 60 * 60 * 1000, // 120 days
        sameSite: 'None',
        secure : true
    });

    res.sendFile(widgetLoaderPath);
});


// Serve widget.html with optional botId
app.get("/widget.html", (req, res) => {
    const botId = req.query.botId || "default-bot";
    const htmlPath = path.join(__dirname, "views", "widget.html");

    fs.readFile(htmlPath, "utf8", (err, data) => {
        if (err) {
            console.log(err);

            return res.status(500).send("Error loading widget");
        }
        // Optionally inject botId into the widget (if needed)
        const customizedHtml = data.replace("{{BOT_ID}}", botId);
        res.set("Content-Type", "text/html");
        res.send(customizedHtml);
    });
});

// let count = 0;
io.on("connection", (socket) => {
    // count++;
    // console.log("Client connected. Total:", count);
    socket.on("newUserLoaded", async (cookies) => {
        console.log("new user loaded");
        if (cookies && cookies.user) {
            socketData[cookies.user] = socket.id
            socket.join(cookies.user);
            console.log(cookies.user);
            
            const isChatExist = await chatSchema.find({ belongsTo: cookies.user, isActive: true });
            // console.log("new load", isChatExist);
            if (isChatExist.length > 0) {
                const userid = cookies.user;
                const allMesg = await fetchAllChat(userid)
                socket.emit("fetchChatHistory", allMesg)
            }
        }
    })


    socket.on("visitor_message", async (data) => {
        console.log(data);
        
        io.to(data.id.user).emit("update-newchat", { message: data.msg, timestamp: Date.now() });
        const chatResponse = await newChat(data);
        console.log('updated message is emmited :)', chatResponse.message.chatID);
        chatResponse.isNewChat ? io.emit("new_visitor_message", { chatResponse }) : io.emit("incoming-message-notification", { to: chatResponse.message.chatID })
        console.log("chat exist ?", chatResponse.isChatExist);
    });

    socket.on("agent-message", async (data) => {
        const socketID = socketData[data.uuid];
        console.log("New Agent Message",data);
        
        if (socketID) {
            io.to(socketID).emit("receive-message", data.msg)
            await newAgentChat(data.msg, data.uuid, data.chatID)
        }
    })

    socket.on("admin-join-newroom", (data) => {
        console.log("user joined the room ", data);
        socket.join(data)
    })

    socket.on("disconnect", () => {
        // count--;
        // console.log("Client disconnected. Total:", count);
    });

    // console.log("Socket ID:", socket.id);
});





http.listen(3000, () => {
    console.log("Server running at http://127.0.0.1:3000");
});
