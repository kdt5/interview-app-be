import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";
import {
  createPost,
  deletePost,
  getPostDetail,
  getPosts,
  updatePost,
} from "../controllers/communityController";
import postMiddleware from "../middlewares/postMiddleware";
import { validatePostBody, validatePostId } from "../middlewares/postValidator";
import { validationErrorMiddleware } from "../middlewares/validationErrorMiddleware";

const router = Router();

router.post(
  "/posts",
  authMiddleware.authenticate,
  validatePostBody,
  validationErrorMiddleware,
  createPost
);
router.delete(
  "/posts/:postId",
  authMiddleware.authenticate,
  validatePostId,
  validationErrorMiddleware,
  postMiddleware.checkPostOwnership,
  deletePost
);
router.patch(
  "/posts/:postId",
  authMiddleware.authenticate,
  validatePostId,
  validatePostBody,
  validationErrorMiddleware,
  postMiddleware.checkPostOwnership,
  updatePost
);
router.get(
  "/posts/:postId",
  authMiddleware.authenticate,
  validatePostId,
  validationErrorMiddleware,
  getPostDetail
);
router.get("/posts", authMiddleware.authenticate, getPosts);

export default router;
