import { body, param } from "express-validator";

const validatePostId = param("postId")
  .notEmpty()
  .withMessage("게시물 ID는 필수입니다.")
  .isInt({ min: 1 })
  .withMessage("게시물 ID는 1 이상의 정수만 가능합니다.");

const validateCommentContent = body("content")
  .notEmpty()
  .withMessage("댓글 내용은 비워둘 수 없습니다.")
  .isLength({ min: 1, max: 500 })
  .withMessage("댓글 내용은 1자 이상 500자 이하로 작성해야 합니다.");

export const validateGetComments = [validatePostId];
export const validateAddComment = [validatePostId, validateCommentContent];
export const validateUpdateComment = [validatePostId, validateCommentContent];
export const validateDeleteComment = [validatePostId];
