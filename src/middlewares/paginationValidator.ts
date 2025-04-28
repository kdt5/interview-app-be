import { query } from "express-validator";

const validatePageSize = query("pageSize")
  .optional()
  .isInt({ min: 1 })
  .withMessage("페이지 사이즈는 1 이상의 정수만 가능합니다.");

const validatePage = query("page")
  .optional()
  .isInt({ min: 1 })
  .withMessage("페이지는 1 이상의 정수만 가능합니다.");

export const validatePagination = [validatePageSize, validatePage];
