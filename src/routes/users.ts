import { RequestHandler, Router } from "express";
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

// 내 정보 조회
router.get("/me", authMiddleware.authenticate, getMe as RequestHandler);

// 닉네임 변경
router.patch(
  "/change-nickname",
  authMiddleware.authenticate,
  validateNickname,
  changeNickname as RequestHandler
);

// 비밀번호 변경
router.patch(
  "/change-password",
  authMiddleware.authenticate,
  validatePassword,
  changePassword as RequestHandler
);

// 비밀번호 찾기
router.post("/recover-password", recoverPassword as RequestHandler);

export default router;
