import { body, param } from "express-validator";

export const validatePostId = [
  param("postId")
    .exists()
    .withMessage("게시물 아이디는 필수입니다.")
    .isInt({ min: 1 })
    .withMessage("게시물 아이디는 1 이상의 정수만 가능합니다."),
];

export const validatePostBody = [
  body("title")
    .exists()
    .withMessage("제목은 필수입니다.")
    .isString()
    .withMessage("제목은 문자열이어야 합니다."),
  body("content")
    .exists()
    .withMessage("내용은 필수입니다.")
    .isString()
    .withMessage("내용은 문자열이어야 합니다."),
];
