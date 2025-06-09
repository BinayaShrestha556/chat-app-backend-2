import express from "express";
import {
  getAuthenticatedUser,
  login,
  logout,
  refresh,
  signin,
  validateRefresh,
} from "../controllers/auth.controller";
import protectRoute from "../middlewares/protectRoute";
const router = express.Router();
router.get("/get-user", protectRoute, getAuthenticatedUser);
router.post("/login", login);
router.post("/logout", logout);
router.post("/signup", signin);
router.post("/refresh", refresh);
router.post("/validate-refresh", validateRefresh);

export default router;
