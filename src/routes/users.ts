import { Router } from "express";
import {
  validateNickname,
  validatePassword,
} from "../middlewares/authValidator.js";
import {
  getMe,
  changeNickname,
  changePassword,
} from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/me", authMiddleware.authenticate, getMe);
router.patch(
  "/change-nickname;",
  authMiddleware.authenticate,
  validateNickname,
  changeNickname
);
router.patch(
  "/change-password",
  authMiddleware.authenticate,
  validatePassword,
  changePassword
);

export default router;
