import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";
import {
  getRankings,
  getMyRankings,
  getLikesRankings,
  getAnswersRankings,
} from "../controllers/rankingController";

const router = Router();

// 통합 순위 조회
router.get("/", authMiddleware.authenticate, getRankings);

// 나의 순위 조회
router.get("/me", authMiddleware.authenticate, getMyRankings);

// 좋아요 순위 조회
router.get("/likes", authMiddleware.authenticate, getLikesRankings);

// 답변 순위 조회
router.get("/answers", authMiddleware.authenticate, getAnswersRankings);

export default router;
