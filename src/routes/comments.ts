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

router.post(
  "/:targetId",
  authMiddleware.authenticate,
  validateAddComment,
  addComment
);
router.get(
  "/:targetId",
  authMiddleware.authenticate,
  validateGetComments,
  getComments
);
router.patch(
  "/:commentId",
  authMiddleware.authenticate,
  validateUpdateComment,
  checkCommentPermission,
  updateComment
);
router.delete(
  "/:commentId",
  authMiddleware.authenticate,
  validateDeleteComment,
  checkCommentPermission,
  deleteComment
);

export default router;
