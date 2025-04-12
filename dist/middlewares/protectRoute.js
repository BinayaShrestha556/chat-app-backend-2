"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const async_handler_1 = require("../utils/async-handler");
const prisma_1 = __importDefault(require("../db/prisma"));
const protectRoute = (0, async_handler_1.asyncHandler)(async (req, res, next) => {
    try {
        const token = req.cookies.access;
        if (!token)
            return res
                .status(401)
                .json({ error: "Unauthorized - no token provoded" });
        const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (!decoded) {
            return res.status(403).json({ error: "Invalid token" });
        }
        const user = await prisma_1.default.user.findUnique({
            where: { id: decoded.id },
        });
        if (!user)
            return res.status(404).json({ error: "user not found" });
        req.user = user;
        next();
    }
    catch (error) {
        if (error.message === "jwt expired")
            return res.status(403).json({ error: "Invalid or expired token" });
        console.log(error);
    }
});
exports.default = protectRoute;
