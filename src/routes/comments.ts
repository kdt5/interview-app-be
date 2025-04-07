import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";
import {
  addComment,
  getComments,
  updateComment,
  deleteComment,
} from "../controllers/commentsController";
import {
  validateAddComment,
  validateDeleteComment,
  validateGetComments,
  validateUpdateComment,
} from "../middlewares/commentValidator";

const router = Router();

router
  .route("/:postId")
  .post(authMiddleware.authenticate, validateAddComment, addComment)
  .get(authMiddleware.authenticate, validateGetComments, getComments)
  .patch(authMiddleware.authenticate, validateUpdateComment, updateComment)
  .delete(authMiddleware.authenticate, validateDeleteComment, deleteComment);
