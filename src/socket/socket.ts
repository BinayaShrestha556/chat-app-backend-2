import jwt from "jsonwebtoken";
import { DefaultEventsMap, Server } from "socket.io";
import http from "http";
import express from "express";
import cookie from "cookie";
import { Socket } from "socket.io";
import { DecodedToken } from "../middlewares/protectRoute";
import prismadb from "../db/prisma";
import { User } from "@prisma/client";
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3001"],
    credentials: true,
  },
});
export interface AuthenticatedSocket
  extends Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> {
  user?: User | null;
}
io.use(async (socket, next) => {
  const rawCookie = socket.handshake.headers.cookie;

  if (!rawCookie) {
    return next(new Error("No cookie sent"));
  }

  const parsed = cookie.parse(rawCookie);
  const token = parsed.token; // adjust if your cookie name is different

  if (!token) {
    return next(new Error("Token missing"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    const user = await prismadb.user.findUnique({
      where: { id: decoded.userId },
    });
    if (!user) {
      next(new Error("not authenticated"));
    }
    (socket as AuthenticatedSocket).user = user;

    next();
  } catch (err) {
    return next(new Error("Invalid or expired token"));
  }
});
const userSocketMap: { [key: string]: string } = {}; //{userId:socketId}
io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
  const userId = socket.handshake.query.userId as string;
  if (!userId) if (userId) userSocketMap[userId] = socket.id;
});
export { io, server, app };
