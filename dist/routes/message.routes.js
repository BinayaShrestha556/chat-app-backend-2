"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const protectRoute_1 = __importDefault(require("../middlewares/protectRoute"));
const messages_controller_1 = require("../controllers/messages.controller");
const router = express_1.default.Router();
router.post("/send-message/:id", protectRoute_1.default, messages_controller_1.sendMessage);
router.get("/get-messages/:id", protectRoute_1.default, messages_controller_1.getMessages);
router.get("/get-conversations", protectRoute_1.default, messages_controller_1.getConversations);
router.post("/create-conversation", protectRoute_1.default, messages_controller_1.createConversation);
exports.default = router;
