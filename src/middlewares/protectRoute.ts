import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../utils/async-handler";
import { User } from "@prisma/client";
interface DecodedToken extends JwtPayload {
  userId: string;
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
      const token = req.cookies.jwt;
      if (!token)
        return res
          .status(401)
          .json({ error: "Unauthorized - no token provoded" });
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as DecodedToken;
      if (!decoded) {
        return res.status(401).json({ error: "Invalid token" });
      }
      const user = await prisma?.user.findUnique({
        where: { id: decoded.userId },
      });
      if (!user) return res.status(404).json({ error: "user not found" });
      req.user = user;
      next();
    } catch (error: any) {
      console.log("Error in protectRoute middleware", error.message);
      res.status(500).json({ error: "internal server Error" });
    }
  }
);
export default protectRoute;
