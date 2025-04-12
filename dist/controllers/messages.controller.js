"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConversation = exports.getConversations = exports.getMessages = exports.sendMessage = void 0;
const async_handler_1 = require("../utils/async-handler");
const prisma_1 = __importDefault(require("../db/prisma"));
exports.sendMessage = (0, async_handler_1.asyncHandler)(async (req, res) => {
    try {
        const { message } = req.body;
        const reicverId = req.params.id;
        const senderId = req.user.id;
        if (!senderId)
            return res.status(400).json({ error: "User not authenticated" });
        if (!message || !reicverId)
            return res.status(400).json({ error: "provide all details" });
        let conversation = await prisma_1.default.conversation.findFirst({
            where: {
                AND: [
                    {
                        participants: {
                            some: {
                                id: senderId,
                            },
                        },
                    },
                    {
                        participants: {
                            some: {
                                id: reicverId,
                            },
                        },
                    },
                ],
            },
        });
        if (!conversation) {
            conversation = await prisma_1.default.conversation.create({
                data: {
                    participants: {
                        connect: [{ id: senderId }, { id: reicverId }],
                    },
                },
            });
        }
        const newMessage = await prisma_1.default.message.create({
            data: {
                senderId,
                body: message,
                conversationId: conversation.id,
            },
        });
        return res.status(201).json(newMessage);
    }
    catch (err) {
        console.log(err.message);
        return res.status(500).json({ error: "Server Error!!" });
    }
});
exports.getMessages = (0, async_handler_1.asyncHandler)(async (req, res) => {
    try {
        const chatId = req.params.id;
        const userId = req.user.id;
        if (!userId)
            return res.status(400).json({ error: "Not logged in." });
        const conversation = await prisma_1.default.conversation.findFirst({
            where: {
                id: chatId,
                participants: {
                    some: {
                        id: userId,
                    },
                },
            },
            select: {
                id: true,
                participants: {
                    select: {
                        id: true,
                        fullname: true,
                        username: true,
                        profilePic: true,
                    },
                },
                messages: {
                    orderBy: {
                        createdAt: "asc",
                    },
                },
                createdAt: true,
            },
        });
        if (!conversation)
            return res.status(404).json({ error: "Conversation not found." });
        return res.json(conversation);
    }
    catch (err) {
        console.log(err.message);
        return res.status(500).json({ error: "Server Error!!" });
    }
});
exports.getConversations = (0, async_handler_1.asyncHandler)(async (req, res) => {
    try {
        const userId = req.user.id;
        const conversation = await prisma_1.default.conversation.findMany({
            where: {
                participants: {
                    some: {
                        id: userId,
                    },
                },
            },
            include: {
                messages: {
                    take: 1,
                    orderBy: {
                        createdAt: "desc",
                    },
                },
                participants: {
                    select: {
                        id: true,
                        username: true,
                        fullname: true,
                        profilePic: true,
                    },
                },
            },
            orderBy: {
                updatedAt: "desc",
            },
        });
        if (!conversation)
            return res.status(404).json({ error: "Conversation not found." });
        return res.json(conversation).status(200);
    }
    catch (error) {
        console.log(error.message);
        return res.status(500).json({ error: "Server Error!!" });
    }
});
exports.createConversation = (0, async_handler_1.asyncHandler)(async (req, res) => {
    try {
        const participants = req.body.users;
        const userId = req.user.id;
        if (!participants.includes(userId)) {
            return res.status(401).json({ error: "Not your chat" });
        }
        for (const id of participants) {
            const user = await prisma_1.default.user.findUnique({ where: { id } });
            if (!user) {
                return res.status(404).json({ error: `User ${id} doesn't exist` });
            }
        }
        const existing = await prisma_1.default.conversation.findMany({
            where: {
                participants: {
                    every: {
                        id: { in: participants },
                    },
                },
            },
            include: {
                participants: true,
            },
        });
        const exactConvo = existing.find((convo) => {
            const ids = convo.participants.map((p) => p.id).sort();
            const sorted = [...participants].sort();
            return (ids.length === sorted.length && ids.every((id, i) => id === sorted[i]));
        });
        if (exactConvo) {
            return res.status(200).json({ id: exactConvo.id, exists: true });
        }
        const convo = await prisma_1.default.conversation.create({
            data: {
                participants: {
                    connect: participants.map((id) => ({ id })),
                },
            },
        });
        return res.status(200).json({ id: convo.id, exists: false });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Something went wrong" });
    }
});
