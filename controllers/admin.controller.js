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
module.exports = { allChats, readChats };
