import express, { Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app: Express = express();

// Middleware
app.use(
  cors({
    origin: process.env.CORS,
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

export default app;
