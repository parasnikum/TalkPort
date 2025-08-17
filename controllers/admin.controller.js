const nanoid = require('nanoid');
const botSchema = require("../models/botSchema");
const chatSchema = require("../models/chatSchema");
const messageSchema = require("../models/messageSchema");


const allChats = async (req, res) => {
  try {
    // Step 1: Get the latest message for each chatID
    const latestMessages = await messageSchema.aggregate([
      {
        $sort: { timestamp: -1 } // Sort messages by newest first
      },
      {
        $group: {
          _id: "$chatID", // Group by chatID
          latestTimestamp: { $first: "$timestamp" } // Keep only the newest message per chat
        }
      },
      {
        $sort: { latestTimestamp: -1 } // Sort chats by latest message timestamp (newest first)
      }
    ]);

    // Step 2: Extract the ordered chatIDs
    const orderedChatIDs = latestMessages.map((msg) => msg._id);

    // Step 3: Fetch the chat documents matching those IDs
    const chats = await chatSchema.find({ _id: { $in: orderedChatIDs } });

    // Step 4: Sort the chats in the same order as orderedChatIDs
    const chatMap = new Map();
    chats.forEach(chat => chatMap.set(String(chat._id), chat));
    const sortedChats = orderedChatIDs.map(id => chatMap.get(String(id))).filter(Boolean);

    // Render the sorted chats
    res.render("admin/index", { allChats: sortedChats });
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).send("Server Error");
  }
};




const readChats = async (req, res) => {
  try {
    const messages = await messageSchema.find({ chatID: req.params.chatID }).sort({ timestamp: 1 });
    res.render('admin/chat', { messages, senderId: messages[0]?.senderId, chatID: req.params.chatID });
  } catch (error) {
    console.error('Error loading messages:', error);
    res.status(500).send('Server Error');
  }
}


const fetchAllBots = async (req, res) => {
  const allBots = await botSchema.find({});
  res.render("./admin/allbots", { bots: allBots });
}



const botConfig = async (req, res) => {
  const botDetails = await botSchema.findOne({ _id: req.params.botid })
  const payload = {
    bot_name: botDetails.title,
    bot_logo: botDetails.avtar,
    greeting_message: botDetails.greetingMessage,
    bot_status: botDetails.status,
    whitelist_domain: (botDetails.allowedDomains).join(),
  }
  res.render("./admin/configBot", { payload })
}




const createNewBotPage = async (req, res) => {
  res.render("./admin/createNewBot")
}


const createNewBot = async (req, res) => {
  console.log(req.body);

  const { bot_name, bot_logo, greeting_message, widget_color, widget_status, whitelist, allowed_domains, disallowed_domains, pre_questions } = req.body;


  if (!bot_name || !bot_logo || !greeting_message || !widget_color || !widget_status || !whitelist || !allowed_domains || !disallowed_domains || !pre_questions) {
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
  res.render("./admin/createNewBot")
}



const analyticsPage = async (req, res) => {
  res.render("./admin/analytics");
}

const homedashboard = async (req, res) => {
  res.render("./admin/dashboard");
}
module.exports = { homedashboard, allChats, readChats, botConfig, fetchAllBots, createNewBotPage, createNewBot, analyticsPage };
