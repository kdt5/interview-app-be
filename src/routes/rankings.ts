import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  getLikesCountRankings,
  getAnswersCountRankings,
} from "../controllers/rankingController.js";

const router = Router();

// 통합 순위 조회
//router.get("/", authMiddleware.authenticate, getRankings);

// 나의 순위 조회
//router.get("/me", authMiddleware.authenticate, getMyRankings);

// 좋아요 순위 조회
router.get("/likes", authMiddleware.authenticate, getLikesCountRankings);

// 답변 순위 조회
router.get("/answers", authMiddleware.authenticate, getAnswersCountRankings);

export default router;
