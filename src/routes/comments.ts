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

router.post(
  "/:targetId",
  validateAddComment,
  addComment
);
router.get(
  "/:targetId",
  validateGetComments,
  getComments
);
router.patch(
  "/:commentId",
  validateUpdateComment,
  checkCommentPermission,
  updateComment
);
router.delete(
  "/:commentId",
  validateDeleteComment,
  checkCommentPermission,
  deleteComment
);

export default router;
