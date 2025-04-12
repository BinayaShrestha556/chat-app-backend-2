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
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
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
export const getConversations = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const conversation = await prismadb.conversation.findMany({
        where: {
          participants: {
            some: {
              id: userId,
            },
          },
        },
        include: {
          messages: {
            take: 1,
            orderBy: {
              createdAt: "desc",
            },
          },
          participants: {
            select: {
              id: true,
              username: true,
              fullname: true,
              profilePic: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
      if (!conversation)
        return res.status(404).json({ error: "Conversation not found." });
      return res.json(conversation).status(200);
    } catch (error: any) {
      console.log(error.message);
      return res.status(500).json({ error: "Server Error!!" });
    }
  }
);
export const createConversation = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const participants: string[] = req.body.users;
      const userId = req.user.id;

      if (!participants.includes(userId)) {
        return res.status(401).json({ error: "Not your chat" });
      }

      for (const id of participants) {
        const user = await prismadb.user.findUnique({ where: { id } });
        if (!user) {
          return res.status(404).json({ error: `User ${id} doesn't exist` });
        }
      }

      const existing = await prismadb.conversation.findMany({
        where: {
          participants: {
            every: {
              id: { in: participants },
            },
          },
        },
        include: {
          participants: true,
        },
      });

      const exactConvo = existing.find((convo) => {
        const ids = convo.participants.map((p) => p.id).sort();
        const sorted = [...participants].sort();
        return (
          ids.length === sorted.length && ids.every((id, i) => id === sorted[i])
        );
      });

      if (exactConvo) {
        return res.status(200).json({ id: exactConvo.id, exists: true });
      }

      const convo = await prismadb.conversation.create({
        data: {
          participants: {
            connect: participants.map((id) => ({ id })),
          },
        },
      });

      return res.status(200).json({ id: convo.id, exists: false });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Something went wrong" });
    }
  }
);
