import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  addComment,
  getComments,
  updateComment,
  deleteComment,
  checkCommentPermission,
} from "../controllers/commentsController.js";
import {
  validateAddComment,
  validateDeleteComment,
  validateGetComments,
  validateUpdateComment,
} from "../middlewares/commentValidator.js";

const router = Router();

router
  .route("/:targetId")
  .all(authMiddleware.authenticate)
  .post(validateAddComment, addComment)
  .get(validateGetComments, getComments)
  .patch(validateUpdateComment, checkCommentPermission, updateComment)
  .delete(validateDeleteComment, checkCommentPermission, deleteComment);

export default router;
