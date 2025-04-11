import { ReportStatus, ReportTargetType } from "@prisma/client";
import { body, param, query } from "express-validator";

export const validateReportId = [
  param("reportId")
    .exists()
    .withMessage("신고 아이디가 필요합니다.")
    .isInt({ min: 1 })
    .withMessage("신고 아이디는 1 이상의 정수여야 합니다."),
];

export const validateGetReportQuery = [
  query("targetType")
    .optional()
    .isIn(Object.values(ReportTargetType))
    .withMessage(
      "신고 대상 타입은 ReportTargetType enum 값 중 하나여야 합니다."
    ),
  query("status")
    .optional()
    .isIn(Object.values(ReportStatus))
    .withMessage("신고 상태는 ReportStatus enum 값 중 하나여야 합니다."),
  query("targetId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("신고 대상 아이디는 1 이상의 정수여야 합니다."),
  query("reporterId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("신고자 아이디는 1 이상의 정수여야 합니다."),
];

export const validateCreateReportBody = [
  body("targetType")
    .exists()
    .withMessage("신고 대상 타입이 필요합니다.")
    .isIn(Object.values(ReportTargetType))
    .withMessage(
      "신고 대상 타입은 ReportTargetType enum 값 중 하나여야 합니다."
    ),
  body("targetId")
    .exists()
    .withMessage("신고 대상 아이디가 필요합니다.")
    .isInt({ min: 1 })
    .withMessage("신고 대상 아이디는 1 이상의 정수여야 합니다."),
  body("reason")
    .notEmpty()
    .withMessage("신고 사유가 필요합니다.")
    .isString()
    .withMessage("신고 사유는 문자열이어야 합니다."),
];

export const validateUpdateReportBody = [
  body("status")
    .exists()
    .withMessage("신고 상태가 필요합니다.")
    .isIn(Object.values(ReportStatus))
    .withMessage("신고 상태는 ReportStatus enum 값 중 하나여야 합니다."),
];
