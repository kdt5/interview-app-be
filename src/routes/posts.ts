import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  createPost,
  deletePost,
  getPostDetail,
  getPosts,
  updatePost,
} from "../controllers/postController.js";
import postMiddleware from "../middlewares/postMiddleware.js";
import {
  validateCreatePost,
  validateDeletePost,
  validateGetPostDetail,
  validateGetPosts,
  validateUpdatePost,
} from "../middlewares/postValidator.js";

const router = Router();

router.use(authMiddleware.authenticate);

router.get("/", validateGetPosts, getPosts);
router.post("/", validateCreatePost, createPost);
router.delete(
  "/:postId",
  validateDeletePost,
  postMiddleware.checkPostOwnership,
  deletePost
);
router.patch(
  "/:postId",
  validateUpdatePost,
  postMiddleware.checkPostOwnership,
  updatePost
);
router.get("/:postId", validateGetPostDetail, getPostDetail);

export default router;
