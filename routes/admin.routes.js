const express = require("express");
const router = express.Router();
const { deleteBot, botStatusUpdate, botAnalytics, botList, dashboard, updateBotConfig, homedashboard, allChats, readChats, botConfig, fetchAllBots, createNewBot, createNewBotPage, analyticsPage } = require("../controllers/admin.controller"); // path as needed

router.get("/", homedashboard);
router.get("/chats", allChats);
router.get("/chat/:chatID", readChats);
router.get("/settings/bots", fetchAllBots);
router.get("/settings/bot/create", createNewBotPage);
router.post("/settings/bot/create", createNewBot);
router.get("/settings/bot/:botid", botConfig);
router.post("/settings/bot/:botid", updateBotConfig);
router.get("/analytics", analyticsPage);
router.get("/", analyticsPage);
router.get("/dashboardDetails", dashboard);
router.get("/botDetails", botList);
router.post("/botAnalytics", botAnalytics);
router.post("/:botId/updateBotStatus", botStatusUpdate);
router.delete("/:botId/deleteBot", deleteBot);

module.exports = router;
