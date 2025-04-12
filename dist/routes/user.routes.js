"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const protectRoute_1 = __importDefault(require("../middlewares/protectRoute"));
const router = (0, express_1.Router)();
router.get("/get-user-details/:id", user_controller_1.getUserDetails);
router.get("/search", protectRoute_1.default, user_controller_1.searchUsers);
exports.default = router;
