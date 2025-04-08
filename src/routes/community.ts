import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";
import { createPost, getPostDetail, getPosts } from "../controllers/communityController";

const router = Router();

router.post("/posts", authMiddleware.authenticate, createPost);
router.delete("/posts/:postId");
router.patch("/posts/:postId");
router.get("/posts/:postId", authMiddleware.authenticate, getPostDetail);
router.get("/posts", authMiddleware.authenticate, getPosts);

export default router;