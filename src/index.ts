import dotenv from "dotenv";

dotenv.config();

import { server, app } from "./socket/socket";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Middleware
const allowedOrigins =
  process.env.CORS === "*"
    ? ["https://localhost:3000"] // fallback
    : process.env.CORS!.split(",");

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Routes
app.get("/", (req, res) => {
  res.send("server is online");
});
import authRoutes from "./routes/auth.route";
app.use("/api/auth", authRoutes);
import messageRoutes from "./routes/message.routes";
app.use("/api/messages", messageRoutes);
import userRoutes from "./routes/user.routes";
app.use("/api/user", userRoutes);

//for pinging
app.get("/api/ping", (req, res) => {
  res.status(200).json({message:"success"});
});
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
