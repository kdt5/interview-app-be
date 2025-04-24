import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  getTrendingQuestions,
  getTrendingPosts,
} from "../controllers/trendingController.js";
import {
  validateTrendingCategoryId,
  validateTrendingLimit,
} from "../middlewares/trendingValidator.js";

const router = Router();

router.get(
  "/questions",
  authMiddleware.authenticate,
  validateTrendingCategoryId,
  validateTrendingLimit,
  getTrendingQuestions
);

router.get(
  "/posts",
  authMiddleware.authenticate,
  validateTrendingCategoryId,
  validateTrendingLimit,
  getTrendingPosts
);

export default router;
