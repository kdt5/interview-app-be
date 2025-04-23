import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";
import {
  getLikesCountRankings,
  getAnswersCountRankings,
  getMyRankings,
  getTotalRankings,
} from "../controllers/rankingController.js";
import { validateRankingLimit } from "../middlewares/rankingValidator.js";

const router = Router();

// 통합 순위 조회
router.get(
  "/",
  authMiddleware.authenticate,
  validateRankingLimit,
  getTotalRankings
);

// 나의 순위 조회
router.get("/me", authMiddleware.authenticate, getMyRankings);

// 좋아요 순위 조회
router.get(
  "/likes",
  authMiddleware.authenticate,
  validateRankingLimit,
  getLikesCountRankings
);

// 답변 순위 조회
router.get(
  "/answers",
  authMiddleware.authenticate,
  validateRankingLimit,
  getAnswersCountRankings
);

export default router;
