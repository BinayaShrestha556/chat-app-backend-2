import prismadb from "../db/prisma";
import { asyncHandler } from "../utils/async-handler";

export const searchUsers = asyncHandler(async (req, res, next) => {
  const q = req.query.q;
  const userId = req.query.dontInclude;
  if (!q) return res.json({ error: "provide some search query" }).json(400);
  try {
    const results = await prismadb.user.findMany({
      where: {
        AND: [
          {
            username: {
              contains: q as string,
              mode: "insensitive", // case-insensitive search
            },
          },
          {
            id: {
              not: userId ? (userId as string) : undefined, // exclude the current user from the results
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
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});
export const getUserDetails = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!id) return res.json({ error: "provide proper id" }).json(400);
  try {
    const user = await prismadb.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullname: true,
        username: true,
        gender: true,
        profilePic: true,
      },
    });
    if (!user) return res.json({ error: "user not found" }).json(400);
    return res.json(user).status(200);
  } catch (error) {
    console.log(error);

    return res.json({ error: "something went wrong" }).json(500);
  }
});
