import express from "express";
import protectRoute from "../middlewares/protectRoute";
import { sendMessage } from "../controllers/messages.controller";
const router = express.Router();
router.post("/send-message/:id", protectRoute, sendMessage);
export default router;
