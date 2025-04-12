"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const protectRoute_1 = __importDefault(require("../middlewares/protectRoute"));
const router = express_1.default.Router();
router.get("/get-user", protectRoute_1.default, auth_controller_1.getAuthenticatedUser);
router.post("/login", auth_controller_1.login);
router.post("/logout", auth_controller_1.logout);
router.post("/signup", auth_controller_1.signin);
router.post("/refresh", auth_controller_1.refresh);
exports.default = router;
