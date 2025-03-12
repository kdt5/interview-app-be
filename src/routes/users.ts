import { RequestHandler, Router } from "express";
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

router.get("/me", authMiddleware.authenticate, getMe as RequestHandler);
router.patch(
  "/change-nickname;",
  authMiddleware.authenticate,
  validateNickname,
  changeNickname as RequestHandler
);
router.patch(
  "/change-password",
  authMiddleware.authenticate,
  validatePassword,
  changePassword as RequestHandler
);

export default router;
