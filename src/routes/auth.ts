import { Router } from "express";
import {
  signup,
  login,
  logout,
  checkEmailAvailability,
  checkNicknameAvailability,
  refresh,
  resetPassword,
} from "../controllers/authController.js";
import {
  validateSignup,
  validateLogin,
  validateEmail,
  validateNickname,
  validateResetPassword,
} from "../middlewares/authValidator.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

// 이메일 중복 확인
router.post("/check-email", validateEmail, checkEmailAvailability);

// 닉네임 중복 확인
router.post("/check-nickname", validateNickname, checkNicknameAvailability);

// 회원가입
router.post("/signup", validateSignup, signup);

// 로그인
router.post("/login", validateLogin, login);

// 로그아웃
router.post("/logout", authMiddleware.authenticate, logout);

// 토큰 갱신
router.post("/refresh", refresh);

// 비밀번호 재설정
router.post("/reset-password", validateResetPassword, resetPassword);

export default router;
