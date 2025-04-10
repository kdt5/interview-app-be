import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";
import {
  addComment,
  getComments,
  updateComment,
  deleteComment,
  checkCommentPermission,
} from "../controllers/commentsController";
import {
  validateAddComment,
  validateDeleteComment,
  validateGetComments,
  validateUpdateComment,
} from "../middlewares/commentValidator";

const router = Router();

router
  .route("comments")
  .all(authMiddleware.authenticate)
  .post(validateAddComment, addComment)
  .get(validateGetComments, getComments)
  .patch(validateUpdateComment, checkCommentPermission, updateComment)
  .delete(validateDeleteComment, checkCommentPermission, deleteComment);
