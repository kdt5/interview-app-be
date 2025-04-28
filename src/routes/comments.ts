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

router.use(authMiddleware.authenticate);

router
  .route("/:targetId")
  .post(validateAddComment, addComment)
  .get(validateGetComments, getComments)
  .patch(validateUpdateComment, checkCommentPermission, updateComment)
  .delete(validateDeleteComment, checkCommentPermission, deleteComment);

export default router;
