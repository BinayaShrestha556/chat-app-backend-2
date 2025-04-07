import express from "express";
import protectRoute from "../middlewares/protectRoute";
import {
  getConversations,
  getMessages,
  sendMessage,
} from "../controllers/messages.controller";
const router = express.Router();
router.post("/send-message/:id", protectRoute, sendMessage);
router.get("/get-messages/:id", protectRoute, getMessages);
router.get("/get-conversations", protectRoute, getConversations);
export default router;
