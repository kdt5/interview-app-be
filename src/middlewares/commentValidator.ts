import { body, param, query } from "express-validator";
import { validationErrorMiddleware } from "./validationErrorMiddleware";
import { CommentCategory } from "../services/commentService";

const validateCommentId = param("commentId")
  .notEmpty()
  .withMessage("댓글 ID는 필수입니다.")
  .isInt({ min: 1 })
  .withMessage("댓글 ID는 1 이상의 정수만 가능합니다.");

const validateTargetId = param("targetId")
  .notEmpty()
  .withMessage("댓글 대상 ID는 필수입니다.")
  .isInt({ min: 1 })
  .withMessage("댓글 대상 ID는 1 이상의 정수만 가능합니다.");

const validateContent = body("content")
  .notEmpty()
  .withMessage("댓글 내용은 비워둘 수 없습니다.")
  .isLength({ min: 1, max: 500 })
  .withMessage("댓글 내용은 1자 이상 500자 이하로 작성해야 합니다.");

const validateCategoryName = query("categoryName")
  .notEmpty()
  .withMessage("카테고리 이름은 필수입니다.")
  .custom((value) => {
    const validCategories = Object.values(CommentCategory) as string[];
    if (!validCategories.includes(value as string)) {
      throw new Error(
        `댓글 카테고리 이름은 ${validCategories.join(", ")}만 가능합니다.`
      );
    }
    return true;
  });

const validateParentId = query("parentId")
  .optional()
  .isInt({ min: 1 })
  .withMessage("부모 댓글 ID는 1 이상의 정수만 가능합니다.");

export const validateGetComments = [
  validateCommentId,
  validateCategoryName,
  validationErrorMiddleware,
];

export const validateAddComment = [
  validateTargetId,
  validateContent,
  validateCategoryName,
  validateParentId,
  validationErrorMiddleware,
];

export const validateUpdateComment = [
  validateCommentId,
  validateContent,
  validationErrorMiddleware,
];

export const validateDeleteComment = [
  validateCommentId,
  validationErrorMiddleware,
];
