import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../utils/async-handler";

import prismadb from "../db/prisma";
import { User } from "@prisma/client";
export interface DecodedToken extends JwtPayload {
  id: string;
}
declare global {
  namespace Express {
    export interface Request {
      user: User;
    }
  }
}
const protectRoute = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : req.cookies?.accessToken;

      if (!token) {
        return res
          .status(401)
          .json({ error: "Unauthorized: No token provided" });
      }

      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!
      ) as DecodedToken;

      if (!decoded?.id) {
        return res.status(403).json({ error: "Invalid token" });
      }

      const user = await prismadb.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      req.user = user;
      next();
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        return res.status(403).json({ error: "Token expired" });
      }
      console.error("Auth error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

export default protectRoute;
