import { body, param, query } from "express-validator";
import { validatePagination } from "./paginationValidator";
import { validationErrorMiddleware } from "./validationErrorMiddleware";

const validatePostParams = [
  param("postId")
    .exists()
    .withMessage("게시물 아이디는 필수입니다.")
    .isInt({ min: 1 })
    .withMessage("게시물 아이디는 1 이상의 정수만 가능합니다."),
];

const validatePostBody = [
  body("title")
    .notEmpty()
    .withMessage("제목은 필수입니다.")
    .isString()
    .withMessage("제목은 문자열이어야 합니다."),
  body("content")
    .notEmpty()
    .withMessage("내용은 필수입니다.")
    .isString()
    .withMessage("내용은 문자열이어야 합니다."),
  body("categoryId")
    .exists()
    .withMessage("게시물 카테고리 아이디는 필수입니다.")
    .isInt({ min: 1 })
    .withMessage("게시물 카테고리 아이디는 1 이상의 정수만 가능합니다."),
];

const validatePostQuery = [
  query("categoryId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("게시물 카테고리 아이디는 1 이상의 정수만 가능합니다."),
];

export const validateGetPosts = [
  ...validatePostQuery,
  ...validatePagination,
  validationErrorMiddleware,
];

export const validateCreatePost = [
  ...validatePostBody,
  ...validatePostQuery,
  validationErrorMiddleware,
];

export const validateDeletePost = [
  ...validatePostParams,
  validationErrorMiddleware,
];

export const validateUpdatePost = [
  ...validatePostParams,
  ...validatePostBody,
  ...validatePostQuery,
  validationErrorMiddleware,
];

export const validateGetPostDetail = [
  ...validatePostParams,
  validationErrorMiddleware,
];

export const validatePostOwnership = [
  ...validatePostParams,
  validationErrorMiddleware,
];
