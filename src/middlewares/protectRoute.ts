import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../utils/async-handler";

import prismadb from "../db/prisma";
import { User } from "../../dist/client";
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
      const token = req.cookies.access;
      if (!token)
        return res
          .status(401)
          .json({ error: "Unauthorized - no token provoded" });
      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!
      ) as DecodedToken;
      if (!decoded) {
        return res.status(403).json({ error: "Invalid token" });
      }

      const user = await prismadb.user.findUnique({
        where: { id: decoded.id },
      });
      if (!user) return res.status(404).json({ error: "user not found" });
      req.user = user;
      next();
    } catch (error: any) {
      if (error.message === "jwt expired")
        return res.status(403).json({ error: "Invalid or expired token" });
      console.log(error);
    }
  }
);
export default protectRoute;
