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
  validatePostBody,
  validatePostId,
} from "../middlewares/postValidator.js";
import { validationErrorMiddleware } from "../middlewares/validationErrorMiddleware.js";

const router = Router();

router.get("/", authMiddleware.authenticate, getPosts);
router.post(
  "/",
  authMiddleware.authenticate,
  validatePostBody,
  validationErrorMiddleware,
  createPost
);
router.delete(
  "/:postId",
  authMiddleware.authenticate,
  validatePostId,
  validationErrorMiddleware,
  postMiddleware.checkPostOwnership,
  deletePost
);
router.patch(
  "/:postId",
  authMiddleware.authenticate,
  validatePostId,
  validatePostBody,
  validationErrorMiddleware,
  postMiddleware.checkPostOwnership,
  updatePost
);
router.get(
  "/:postId",
  authMiddleware.authenticate,
  validatePostId,
  validationErrorMiddleware,
  getPostDetail
);

export default router;
