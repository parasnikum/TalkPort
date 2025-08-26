const { nanoid } = require('nanoid');
const botSchema = require("../models/botSchema");
const chatSchema = require("../models/chatSchema");
const messageSchema = require("../models/messageSchema");


// const allChats = async (req, res) => {
//   try {
//     // Step 1: Get the latest message for each chatID
//     const latestMessages = await messageSchema.aggregate([
//       {
//         $sort: { timestamp: -1 } // Sort messages by newest first
//       },
//       {
//         $group: {
//           _id: "$chatID", // Group by chatID
//           latestTimestamp: { $first: "$timestamp" } // Keep only the newest message per chat
//         }
//       },
//       {
//         $sort: { latestTimestamp: -1 } // Sort chats by latest message timestamp (newest first)
//       }
//     ]);

//     // Step 2: Extract the ordered chatIDs
//     const orderedChatIDs = latestMessages.map((msg) => msg._id);

//     // Step 3: Fetch the chat documents matching those IDs
//     const chats = await chatSchema.find({ _id: { $in: orderedChatIDs } });

//     // Step 4: Sort the chats in the same order as orderedChatIDs
//     const chatMap = new Map();
//     chats.forEach(chat => chatMap.set(String(chat._id), chat));
//     const sortedChats = orderedChatIDs.map(id => chatMap.get(String(id))).filter(Boolean);

//     // Render the sorted chats
//     res.render("admin/index", { allChats: sortedChats });
//   } catch (error) {
//     console.error("Error fetching chats:", error);
//     res.status(500).send("Server Error");
//   }
// };

// const readChats = async (req, res) => {
//   try {
//     const messages = await messageSchema.find({ chatID: req.params.chatID }).sort({ timestamp: 1 });
//     res.render('admin/chat', { messages, senderId: messages[0]?.senderId, chatID: req.params.chatID });
//   } catch (error) {
//     console.error('Error loading messages:', error);
//     res.status(500).send('Server Error');
//   }
// }

const allChats = async (req, res) => {
  try {
    // Step 1: Get the latest message for each chatID
    const latestMessages = await messageSchema.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$chatID",
          latestTimestamp: { $first: "$timestamp" },
          latestMessage: { $first: "$content" }, // keep the message content
        }
      },
      { $sort: { latestTimestamp: -1 } }
    ]);

    // Step 2: Extract the ordered chatIDs
    const orderedChatIDs = latestMessages.map(msg => msg._id);

    // Step 3: Fetch chats
    const chats = await chatSchema.find({ _id: { $in: orderedChatIDs } });

    // Step 4: Map chats with latest message
    const chatMap = new Map();
    chats.forEach(chat => chatMap.set(String(chat._id), chat));

    const sortedChats = orderedChatIDs.map(id => {
      const chat = chatMap.get(String(id));
      const msg = latestMessages.find(m => String(m._id) === String(id));
      return {
        id: chat._id,
        chatID: chat.chatID,
        botID: chat.botID,
        belongsTo: chat.belongsTo,
        createdAt: chat.createdAt,
        isActive: chat.isActive,
        lastMessage: msg?.latestMessage || "",
        timestamp: msg?.latestTimestamp || chat.createdAt,
        status: chat.isActive ? "active" : "resolved", // map boolean to status
        userName: chat.belongsTo, // temporary, until you fetch real user
        botName: chat.botID,      // temporary, until you fetch real bot
        unread: false
      };
    }).filter(Boolean);

    // ✅ Send JSON, not render()
    res.json(sortedChats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

const readChats = async (req, res) => {
  try {
    const { chatID } = req.params;
    const messages = await messageSchema.find({ chatID: chatID }).sort({ timestamp: 1 });
    console.log("reading chats");

    res.json(
      messages.map(msg => ({
        _id: msg._id.toString(),
        sender: msg.senderId, // "bot" | "user"
        content: msg.msgContent,
        timestamp: msg.timestamp,
      }))
    );
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Server error" });
  }
};






const fetchAllBots = async (req, res) => {
  const allBots = await botSchema.find({});
  res.render("./admin/allbots", { bots: allBots });
}



const botConfig = async (req, res) => {
  const botDetails = await botSchema.findOne({ _id: req.params.botid })
  const payload = {
    id: botDetails._id,
    bot_name: botDetails.title,
    bot_logo: botDetails.avtar,
    greeting_message: botDetails.greetingMessage,
    bot_status: botDetails.status,
    whitelist_domain: (botDetails.allowedDomains).join(),
  }
  res.render("./admin/configBot", { payload })
}


const updateBotConfig = async (req, res) => {
  console.log(req.body);
  console.log();
  const { bot_name, bot_logo, greeting_message, bot_status, whitelist_domain } = req.body;
  await botSchema.updateOne(
    { _id: req.params.botid },
    {
      title: bot_name,
      avtar: bot_logo,
      greetingMessage: greeting_message,
      status: bot_status,
      allowedDomains: whitelist_domain
    }
  );

  res.redirect(`/admin/settings/bot/${req.params.botid}`,)
}





const createNewBotPage = async (req, res) => {
  res.render("./admin/createNewBot")
}


const createNewBot = async (req, res) => {

  const { bot_name, bot_logo, greeting_message, widget_color, widget_status, whitelist, allowed_domains, disallowed_domains, pre_questions } = req.body;


  if (!bot_name || !bot_logo || !greeting_message || !widget_color || !widget_status || !allowed_domains || !disallowed_domains) {

    return res.json({ "error": "all fields must need" })
  }
  const data = {
    createdBy: "asd",
    uniqueBotId: nanoid(),
    title: bot_name,
    whitelist: whitelist,
    avtar: bot_logo,
    allowedDomains: allowed_domains,
    disallowedDomains: disallowed_domains,
    preQuestions: pre_questions,
    color: widget_color,
    status: widget_status,
    greetingMessage: greeting_message
  }

  await botSchema.create(data);
  console.log("bot created");

  res.render("./admin/createNewBot")
}


const dashboard = async (req, res) => {
  const chats = await chatSchema.find({}).sort({ createdAt: 1 }).limit(3);
  const chatCount = await chatSchema.countDocuments({});
  const totalActive = await chatSchema.find({ isActive: true });
  const bots = await botSchema.find({});
  const recentChats = chats.length > 3 ? chats.slice(0, 3) : chats.slice(0, chats.length)

  const payload = {
    chatCount: chatCount,
    activeChats: totalActive.length,
    activeBots: bots.length,
    recentChats: recentChats,
  }
  return res.json(payload);
}



const botList = async (req, res) => {
  const bots = await botSchema.find({}).sort({ createdAt: 1 });
  const activeBots = await botSchema.find({ status: "Enable" }).sort({ createdAt: 1 });
  const botCount = await botSchema.countDocuments({});
  const totalBotConvo = await chatSchema.countDocuments();

  const payload = {
    chatCount: botCount,
    activeBots: activeBots,
    conversations: totalBotConvo,
    allbots: bots
  }
  return res.json(payload);
}


const analyticsPage = async (req, res) => {
  res.render("./admin/analytics");
}




const botAnalytics = async (req, res) => {
  const bots = await botSchema.find({});
  const totalconvo = await chatSchema.countDocuments();
  try {
    const totalChats = await chatSchema.countDocuments();
    const activeChats = await chatSchema.countDocuments({ isActive: true });
    const totalBots = await botSchema.countDocuments();
    const activeBots = await botSchema.countDocuments({ status: "Enable" });

    const resolvedChats = 30;
    const averageResponseTime = 150;
    const satisfactionRate = 4.6;

    const analytics = {
      totalChats,
      activeChats,
      resolvedChats,
      averageResponseTime,
      satisfactionRate,
      totalBots,
      activeBots,
      bots : bots
    };

    res.json(analytics);
  } catch (error) {
    console.log(error);
    
    res.json({ "Error getting chat counts ": error });
  }
  // bots.forEach(bot => {
  //   console.log(bot.title);
  // });
  return;
}

// List of fields allowed to update
const allowedUpdateFields = [
  "whitelist",
  "allowedDomains",
  "disallowedDomains",
  "title",
  "avtar",
  "preQuestions",
  "color",
  "bg_color",
  "msg_agent_color",
  "user_msg_color",
  "msg_text_color",
  "status",
  "greetingMessage",
];

// Helper to pick allowed fields from source object
function pickAllowedFields(source, allowedFields) {
  return allowedFields.reduce((obj, field) => {
    if (source[field] !== undefined) {
      obj[field] = source[field];
    }
    return obj;
  }, {});
}

const updateBot = async (req, res) => {
  try {
    const { _id } = req.body;

    if (!_id) {
      return res.status(400).json({ error: "Missing bot _id in request body" });
    }

    // Extract only allowed fields from req.body
    const updateFields = pickAllowedFields(req.body, allowedUpdateFields);

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: "No valid fields provided to update" });
    }

    const updatedBot = await botSchema.findByIdAndUpdate(
      _id,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedBot) {
      return res.status(404).json({ error: "Bot not found" });
    }

    res.status(200).json({ message: "Bot updated successfully", bot: updatedBot });
  } catch (error) {
    console.error("Error updating bot:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


const homedashboard = async (req, res) => {
  res.render("./admin/dashboard");
}
module.exports = { updateBot, botAnalytics, botList, dashboard, updateBotConfig, homedashboard, allChats, readChats, botConfig, fetchAllBots, createNewBotPage, createNewBot, analyticsPage };
