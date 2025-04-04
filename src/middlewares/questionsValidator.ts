import { body, param, query } from "express-validator";
import dayjs from "dayjs";

export const validateQuestionId = [
  param("questionId")
    .exists()
    .withMessage("질문 아이디는 필수입니다.")
    .isInt({ min: 1 })
    .withMessage("질문 아이디는 1 이상의 정수만 가능합니다."),
];

export const validateGetAllQuestion = [
  query("positionId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("포지션 아이디는 1 이상의 정수만 가능합니다."),
  query("categoryId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("카테고리 아이디는 1 이상의 정수만 가능합니다."),
];

export const validateAddWeeklyQuestion = [
  body("questionId")
    .exists()
    .isInt({ min: 1 })
    .withMessage("질문 아이디는 1 이상의 정수만 가능합니다."),
  body("startDate")
    .exists()
    .custom((value: string) => {
      if (!dayjs(value).isValid()) {
        throw new Error("날짜 형식이 올바르지 않습니다.");
      }
      if (!dayjs(value).isAfter(dayjs())) {
        throw new Error("시작일은 현재 날짜 이후여야 합니다.");
      }
      return true;
    }),
];
