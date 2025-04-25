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
  validatePostBody,
  validatePostId,
  validatePostQuery,
} from "../middlewares/postValidator.js";
import { validationErrorMiddleware } from "../middlewares/validationErrorMiddleware.js";

const router = Router();

router.get(
  "/",
  authMiddleware.authenticate,
  validatePostQuery,
  validationErrorMiddleware,
  getPosts
);
router.post(
  "/",
  authMiddleware.authenticate,
  validatePostBody,
  validatePostQuery,
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
  validatePostQuery,
  validationErrorMiddleware,
  postMiddleware.checkPostOwnership,
  updatePost
);
router.get("/categories", authMiddleware.authenticate, getPostCategories);
router.get(
  "/:postId/ownership",
  authMiddleware.authenticate,
  validatePostId,
  validationErrorMiddleware,
  postMiddleware.checkPostOwnership,
  passPostOwnershipCheck
);
router.get(
  "/:postId",
  authMiddleware.authenticate,
  validatePostId,
  validationErrorMiddleware,
  getPostDetail
);

export default router;
