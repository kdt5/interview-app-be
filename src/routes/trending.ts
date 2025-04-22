import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  getTrendingQuestions,
  getTrendingPosts,
} from "../controllers/trendingController.js";

const router = Router();

router.get("/questions", authMiddleware.authenticate, getTrendingQuestions);

router.get("/posts", authMiddleware.authenticate, getTrendingPosts);

export default router;
