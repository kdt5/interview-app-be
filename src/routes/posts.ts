import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  createPost,
  deletePost,
  getPostCategories,
  getPostDetail,
  getPosts,
  passPostOwnershipCheck,
  updatePost,
} from "../controllers/postController.js";
import postMiddleware from "../middlewares/postMiddleware.js";
import {
  validateCreatePost,
  validateDeletePost,
  validateGetPostDetail,
  validateGetPosts,
  validatePostOwnership,
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
router.get("/categories", getPostCategories);
router.get(
  "/:postId/ownership",
  validatePostOwnership,
  postMiddleware.checkPostOwnership,
  passPostOwnershipCheck
);
router.get("/:postId", validateGetPostDetail, getPostDetail);

export default router;
