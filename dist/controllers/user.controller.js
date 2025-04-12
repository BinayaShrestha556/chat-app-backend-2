"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserDetails = exports.searchUsers = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
const async_handler_1 = require("../utils/async-handler");
exports.searchUsers = (0, async_handler_1.asyncHandler)(async (req, res, next) => {
    const { id: userId } = req.user;
    const q = req.query.q;
    if (!q)
        return res.json({ error: "provide some search query" }).json(400);
    try {
        const results = await prisma_1.default.user.findMany({
            where: {
                AND: [
                    {
                        username: {
                            contains: q,
                            mode: "insensitive", // case-insensitive search
                        },
                    },
                    {
                        id: {
                            not: userId,
                        },
                    },
                ],
            },
            select: {
                id: true,
                fullname: true,
                gender: true,
                profilePic: true,
                username: true,
            },
        });
        res.json(results).status(200);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Something went wrong" });
    }
});
exports.getUserDetails = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const id = req.params.id;
    if (!id)
        return res.json({ error: "provide proper id" }).json(400);
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { id },
            select: {
                id: true,
                fullname: true,
                username: true,
                gender: true,
                profilePic: true,
            },
        });
        if (!user)
            return res.json({ error: "user not found" }).json(400);
        return res.json(user).status(200);
    }
    catch (error) {
        console.log(error);
        return res.json({ error: "something went wrong" }).json(500);
    }
});
