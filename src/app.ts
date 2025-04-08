import express, { Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3001"],
    credentials: true,
  })
);
import { app } from "./socket/socket";
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

export default app;
