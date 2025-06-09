import jwt from "jsonwebtoken";
import { Response } from "express";
export const generateRefreshToken = (userId: string, res: Response) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET!, {
    expiresIn: "15d",
  });
  res.cookie("refreshToken", token, {
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });
  return token;
};
