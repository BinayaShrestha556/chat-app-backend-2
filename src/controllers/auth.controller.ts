import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import prismadb from "../db/prisma";
import bcryptjs from "bcryptjs";
import { asyncHandler } from "../utils/async-handler";
import { generateRefreshToken } from "../utils/tokens";

export const login = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { password, username } = req.body;

    if (!username || !password)
      return res.status(400).json({ error: "Provide credentials" });
    const user = await prismadb.user.findUnique({ where: { username } });
    if (!user) return res.status(400).json({ error: "User doesnt exist" });
    const isPasswordCorrect = await bcryptjs.compare(password, user.password);
    if (!isPasswordCorrect)
      return res.status(400).json({ error: "Incorrect Credentials" });
    const refreshToken = generateRefreshToken(user.id, res);
    const newAccessToken = jwt.sign(
      { id: user.id },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "60m" }
    );
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    return res.status(200).json({
      refreshToken,
      accessToken: newAccessToken,
      id: user.id,
      fullname: user.fullname,
      username: user.username,
      profilePic: user.profilePic,
    });
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ error: "Server Error!!" });
  }
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  try {
    res.clearCookie("access", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    res.clearCookie("refresh", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    res.status(200).json({ message: "Logged out successfully." });
  } catch (error: any) {
    console.log("Error in logging out ", error.message);
    return res.status(500).json("something went wrong");
  }
});
export const signin = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { fullname, username, password, gender } = req.body;
    if (!fullname || !username || !password || !gender) {
      return res.status(400).json({ error: "Please fill in all fields." });
    }
    const user = await prismadb.user.findUnique({ where: { username } });
    if (user) return res.status(400).json({ error: "User already exists." });
    const salt = await bcryptjs.genSalt(10);
    const hashedPass = await bcryptjs.hash(password, salt);
    const avatar = `https://avatar.iran.liara.run/public/${
      gender === "male" ? "boy" : "girl"
    }?username=${username}`;
    const newUser = await prismadb.user.create({
      data: {
        username,
        password: hashedPass,
        profilePic: avatar,
        gender,
        fullname,
      },
    });
    if (newUser) {
      const refreshToken = generateRefreshToken(newUser.id, res);
      const newAccessToken = jwt.sign(
        { id: newUser.id },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: "60m" }
      );

      return res
        .json({
          refreshToken,
          accessToken: newAccessToken,
          id: newUser.id,
          username,
          profilePic: newUser.profilePic,
          gender,
          fullname,
        })
        .status(201);
    } else return res.json({ error: "invalid data" }).status(400);
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ error: "Server Error!!" });
  }
});
export const getAuthenticatedUser = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const user = await prismadb.user.findUnique({
        where: { id: req.user.id },
      });
      if (!user) {
        return res.status(404).json({ error: "user not found" });
      }
      const { id, fullname, username, profilePic } = user;
      return res.status(200).json({ id, fullname, username, profilePic });
    } catch (error: any) {
      console.log(error.message);
      return res.status(500).json({ error: "Server Error!!" });
    }
  }
);
export const refresh = asyncHandler(async (req, res) => {
  console.log("refresh request hit");
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : req.cookies?.refreshToken;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET as string,
    async (err: any, decoded: any) => {
      if (err) return res.status(403).json({ error: "Invalid refresh token" });

      const userId = (decoded as any).id;
      const user = await prismadb.user.findUnique({ where: { id: userId } });
      if (!user) return res.status(400).json({ error: "user not found." });
      const newAccessToken = jwt.sign(
        { id: userId },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: "60m" }
      );
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });
      console.log("cookie set");
      return res.status(200).json({ accessToken: newAccessToken });
    }
  );
});
export const validateRefresh = asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }
  console.log("verification request hit");
  jwt.verify(
    token,
    process.env.JWT_SECRET as string,
    async (err: any, decoded: any) => {
      if (err) return res.status(403).json({ error: "Invalid refresh token" });

      const userId = (decoded as any).id;
      const user = await prismadb.user.findUnique({ where: { id: userId } });
      if (!user) return res.status(400).json({ error: "user not found." });

      // console.log("cookie set");
      return res.status(200).json({ message: "verified" });
    }
  );
});
