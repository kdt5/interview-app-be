import { Router } from "express";
import {
  validateNickname,
  validatePassword,
} from "../middlewares/authValidator.js";
import {
  getMe,
  changeNickname,
  changePassword,
  recoverPassword,
} from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/me", authMiddleware.authenticate, getMe);

// 닉네임 변경
router.patch(
  "/change-nickname",
  authMiddleware.authenticate,
  validateNickname,
  changeNickname
);

// 비밀번호 변경
router.patch(
  "/change-password",
  authMiddleware.authenticate,
  validatePassword,
  changePassword
);

// 비밀번호 찾기
router.post("/recover-password", recoverPassword);

export default router;
