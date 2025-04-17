import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";
import {
  getTrendingQuestions,
  getTrendingPosts,
} from "../controllers/trendingController";

const router = Router();

router.get("/questions", authMiddleware.authenticate, getTrendingQuestions);

router.get("/posts", authMiddleware.authenticate, getTrendingPosts);

export default router;
