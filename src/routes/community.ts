import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";
import { createPost } from "../controllers/communityController";

const router = Router();

router.post("/posts", authMiddleware.authenticate, createPost);
router.get("/posts/:postId", authMiddleware.authenticate, getPostDetail);
router.get("/posts/:postId/comments", authMiddleware.authenticate, getRecentPosts);

export default router;