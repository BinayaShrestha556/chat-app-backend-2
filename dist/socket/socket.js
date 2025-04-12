"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = exports.server = exports.io = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const prisma_1 = __importDefault(require("../db/prisma"));
const app = (0, express_1.default)();
exports.app = app;
const server = http_1.default.createServer(app);
exports.server = server;
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.CORS,
        methods: ["GET", "POST"],
    },
});
exports.io = io;
io.use(async (socket, next) => {
    try {
        const rawCookie = socket.handshake.headers.cookie; // Raw cookie string
        if (!rawCookie) {
            return next(new Error("No cookie sent"));
        }
        // Split the cookie string by `;` to separate each cookie
        const cookies = rawCookie.split(";");
        // Find the 'jwt' cookie by searching for it
        let jwtToken;
        for (const cookie of cookies) {
            const [key, value] = cookie.trim().split("=");
            if (key === "access") {
                jwtToken = value;
                break;
            }
        }
        if (!jwtToken) {
            return next(new Error("JWT token not found"));
        }
        const decoded = jsonwebtoken_1.default.verify(jwtToken, process.env.ACCESS_TOKEN_SECRET);
        const user = await prisma_1.default.user.findUnique({
            where: { id: decoded.id },
        });
        if (!user) {
            next(new Error("not authenticated"));
        }
        socket.user = user;
        next();
    }
    catch (err) {
        console.log(err);
        return next(new Error("Invalid or expired token"));
    }
});
const userSocketMap = {}; //{userId:socketId}
io.on("connection", (socket) => {
    // Join a conversation room
    socket.on("join-room", (conversationId) => {
        if (socket.rooms.has(conversationId)) {
        }
        else {
            socket.join(conversationId);
        }
    });
    // Leave a room (optional)
    socket.on("leave-room", (conversationId) => {
        socket.leave(conversationId);
    });
    socket.on("join-all-rooms", (conversationIds) => {
        conversationIds.forEach((id) => socket.join(id));
    });
    // Send a message
    socket.on("send-message", async ({ roomId, message, pic }) => {
        if (!socket.user)
            return;
        // Save message to DB
        const newMessage = await prisma_1.default.message.create({
            data: {
                senderId: socket.user.id,
                conversationId: roomId,
                body: message,
                pic,
            },
            select: {
                id: true,
                senderId: true,
                body: true,
                pic: true,
                createdAt: true,
            },
        });
        // Broadcast message to everyone in the room
        socket.to(roomId).emit("receive-message", {
            conversationId: roomId,
            newMessage,
        });
    });
    socket.on("disconnect", () => { });
});
