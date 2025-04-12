import jwt from "jsonwebtoken";
import { DefaultEventsMap, Server, Socket } from "socket.io";
import http from "http";
import express from "express";

import { DecodedToken } from "../middlewares/protectRoute";
import prismadb from "../db/prisma";
import { User } from "dist/client";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS,
    methods: ["GET", "POST"],
  },
});
export interface AuthenticatedSocket
  extends Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> {
  user?: User | null;
}
io.use(async (socket, next) => {
  try {
    const rawCookie = socket.handshake.headers.cookie; // Raw cookie string

    if (!rawCookie) {
      return next(new Error("No cookie sent"));
    }

    // Split the cookie string by `;` to separate each cookie
    const cookies = rawCookie.split(";");

    // Find the 'jwt' cookie by searching for it
    let jwtToken: string | undefined;
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

    const decoded = jwt.verify(
      jwtToken,
      process.env.ACCESS_TOKEN_SECRET!
    ) as DecodedToken;
    const user = await prismadb.user.findUnique({
      where: { id: decoded.id },
    });
    if (!user) {
      next(new Error("not authenticated"));
    }

    (socket as AuthenticatedSocket).user = user;

    next();
  } catch (err) {
    console.log(err);
    return next(new Error("Invalid or expired token"));
  }
});
const userSocketMap: { [key: string]: string } = {}; //{userId:socketId}
io.on("connection", (socket: AuthenticatedSocket) => {
  // Join a conversation room
  socket.on("join-room", (conversationId: string) => {
    if (socket.rooms.has(conversationId)) {
    } else {
      socket.join(conversationId);
    }
  });

  // Leave a room (optional)
  socket.on("leave-room", (conversationId: string) => {
    socket.leave(conversationId);
  });
  socket.on("join-all-rooms", (conversationIds) => {
    conversationIds.forEach((id: string) => socket.join(id));
  });

  // Send a message
  socket.on("send-message", async ({ roomId, message, pic }) => {
    if (!socket.user) return;

    // Save message to DB
    const newMessage = await prismadb.message.create({
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

  socket.on("disconnect", () => {});
});

export { io, server, app };
