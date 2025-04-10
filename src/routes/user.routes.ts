import { Router } from "express";
import { getUserDetails, searchUsers } from "../controllers/user.controller";
import protectRoute from "../middlewares/protectRoute";
const router = Router();
router.get("/get-user-details/:id", getUserDetails);
router.get("/search", protectRoute, searchUsers);
export default router;
