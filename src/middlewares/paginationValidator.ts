import { query } from "express-validator";

const validateLimit = query("limit")
  .optional()
  .isInt({ min: 1 })
  .withMessage("페이지의 콘텐츠 최대 수는 1 이상의 정수만 가능합니다.");

const validatePage = query("page")
  .optional()
  .isInt({ min: 1 })
  .withMessage("페이지는 1 이상의 정수만 가능합니다.");

export const validatePagination = [validateLimit, validatePage];
