import { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import prismadb from "../db/prisma";

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    const reicverId = req.params.id;
    const senderId = req.user.id;
    if (!senderId)
      return res.status(400).json({ error: "User not authenticated" });
    if (!message || !reicverId)
      return res.status(400).json({ error: "provide all details" });
    let conversation = await prismadb.conversation.findFirst({
      where: {
        AND: [
          {
            participants: {
              some: {
                id: senderId,
              },
            },
          },
          {
            participants: {
              some: {
                id: reicverId,
              },
            },
          },
        ],
      },
    });
    if (!conversation) {
      conversation = await prismadb.conversation.create({
        data: {
          participants: {
            connect: [{ id: senderId }, { id: reicverId }],
          },
        },
      });
    }
    const newMessage = await prismadb.message.create({
      data: {
        senderId,
        body: message,
        conversationId: conversation.id,
      },
    });
    return res.status(201).json(newMessage);
  } catch (err: any) {
    console.log(err.message);
    return res.status(500).json({ error: "Server Error!!" });
  }
});
export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  try {
    const chatId = req.params.id;
    const userId = req.user.id;
    if (!userId) return res.status(400).json({ error: "Not logged in." });
    const conversation = await prismadb.conversation.findFirst({
      where: {
        id: chatId,
        participants: {
          some: {
            id: userId,
          },
        },
      },
      select: {
        id: true,
        participants: {
          select: {
            id: true,
            fullname: true,
            username: true,
            profilePic: true,
          },
        },
        messages: true,
        createdAt: true,
      },
    });
    if (!conversation)
      return res.status(404).json({ error: "Conversation not found." });
    return res.json(conversation);
  } catch (err: any) {
    console.log(err.message);
    return res.status(500).json({ error: "Server Error!!" });
  }
});
