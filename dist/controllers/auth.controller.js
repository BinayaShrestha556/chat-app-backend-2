"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refresh = exports.getAuthenticatedUser = exports.signin = exports.logout = exports.login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../db/prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const async_handler_1 = require("../utils/async-handler");
const tokens_1 = require("../utils/tokens");
exports.login = (0, async_handler_1.asyncHandler)(async (req, res) => {
    try {
        const { password, username } = req.body;
        if (!username || !password)
            return res.status(400).json({ error: "Provide credentials" });
        const user = await prisma_1.default.user.findUnique({ where: { username } });
        if (!user)
            return res.status(400).json({ error: "User doesnt exist" });
        const isPasswordCorrect = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordCorrect)
            return res.status(400).json({ error: "Incorrect Credentials" });
        (0, tokens_1.generateRefreshToken)(user.id, res);
        const newAccessToken = jsonwebtoken_1.default.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "60m" });
        res.cookie("access", newAccessToken, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
        });
        return res.status(200).json({
            id: user.id,
            fullname: user.fullname,
            username: user.username,
            profilePic: user.profilePic,
        });
    }
    catch (error) {
        console.log(error.message);
        return res.status(500).json({ error: "Server Error!!" });
    }
});
exports.logout = (0, async_handler_1.asyncHandler)(async (req, res) => {
    try {
        res.cookie("refresh", "", { maxAge: 0 });
        res.cookie("access", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully." });
    }
    catch (error) {
        console.log("Error in logging out ", error.message);
        return res.status(500).json("something went wrong");
    }
});
exports.signin = (0, async_handler_1.asyncHandler)(async (req, res) => {
    try {
        const { fullname, username, password, gender } = req.body;
        if (!fullname || !username || !password || !gender) {
            return res.status(400).json({ error: "Please fill in all fields." });
        }
        const user = await prisma_1.default.user.findUnique({ where: { username } });
        if (user)
            return res.status(400).json({ error: "User already exists." });
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPass = await bcryptjs_1.default.hash(password, salt);
        const avatar = `https://avatar.iran.liara.run/public/${gender === "male" ? "boy" : "girl"}?username=${username}`;
        const newUser = await prisma_1.default.user.create({
            data: {
                username,
                password: hashedPass,
                profilePic: avatar,
                gender,
                fullname,
            },
        });
        if (newUser) {
            (0, tokens_1.generateRefreshToken)(newUser.id, res);
            const newAccessToken = jsonwebtoken_1.default.sign({ id: newUser.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "60m" });
            res.cookie("access", newAccessToken, {
                httpOnly: true,
                sameSite: "none",
                secure: true,
            });
            return res
                .json({
                id: newUser.id,
                username,
                profilePic: newUser.profilePic,
                gender,
                fullname,
            })
                .status(201);
        }
        else
            return res.json({ error: "invalid data" }).status(400);
    }
    catch (error) {
        console.log(error.message);
        return res.status(500).json({ error: "Server Error!!" });
    }
});
exports.getAuthenticatedUser = (0, async_handler_1.asyncHandler)(async (req, res) => {
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.user.id },
        });
        if (!user) {
            return res.status(404).json({ error: "user not found" });
        }
        const { id, fullname, username, profilePic } = user;
        return res.status(200).json({ id, fullname, username, profilePic });
    }
    catch (error) {
        console.log(error.message);
        return res.status(500).json({ error: "Server Error!!" });
    }
});
exports.refresh = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const token = req.cookies.refresh;
    if (!token)
        return res.status(401).json({ error: "Refresh token missing" });
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err)
            return res.status(403).json({ error: "Invalid refresh token" });
        const userId = decoded.id;
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user)
            return res.status(400).json({ error: "user not found." });
        const newAccessToken = jsonwebtoken_1.default.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "60m" });
        res.cookie("access", newAccessToken, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
        });
        return res.status(200).json({ accessToken: newAccessToken });
    });
});
