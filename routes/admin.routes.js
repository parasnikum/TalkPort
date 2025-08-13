const express = require("express");
const router = express.Router();
const { allChats ,readChats} = require("../controllers/admin.controller"); // path as needed

router.get("/", allChats);
router.get("/chat/:chatID", readChats);

module.exports = router;
