"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const socket_1 = require("./socket/socket");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// Middleware
const allowedOrigins = process.env.CORS === "*"
    ? ["https://localhost:3000"] // fallback
    : process.env.CORS.split(",");
socket_1.app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true,
}));
socket_1.app.use(express_1.default.json());
socket_1.app.use(express_1.default.urlencoded({ extended: true }));
socket_1.app.use((0, cookie_parser_1.default)());
// Routes
socket_1.app.get("/", (req, res) => {
    res.send("server is online");
});
const auth_route_1 = __importDefault(require("./routes/auth.route"));
socket_1.app.use("/api/auth", auth_route_1.default);
const message_routes_1 = __importDefault(require("./routes/message.routes"));
socket_1.app.use("/api/messages", message_routes_1.default);
const user_routes_1 = __importDefault(require("./routes/user.routes"));
socket_1.app.use("/api/user", user_routes_1.default);
const PORT = process.env.PORT || 3000;
socket_1.server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
