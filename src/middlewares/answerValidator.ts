import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import {
  EditAnswerRequest,
  RecordAnswerRequest,
} from "../controllers/answerController.js";
import { validatePagination } from "./paginationValidator.js";
import { body, param, query } from "express-validator";
import { validationErrorMiddleware } from "./validationErrorMiddleware.js";

const validateAnswerContent = [
  body("content")
    .isString().withMessage("문자열만 가능합니다.")
    .notEmpty().withMessage("빈 문자열은 불가합니다.")
    .isLength({max: 1500}).withMessage("답변은 최대 1500자까지 가능합니다."),
];

const validateNewAnswerContent = [
  body("newAnswer")
    .isString().withMessage("문자열만 가능합니다.")
    .notEmpty().withMessage("빈 문자열은 불가합니다.")
    .isLength({max: 1500}).withMessage("답변은 최대 1500자까지 가능합니다."),
];

const validateQuestionId = [
  param("questionId")
    .isInt({min: 1}).withMessage("1 이상의 정수만 가능합니다.")
    .exists().withMessage("questionId는 필수입니다."),
];

export const validateAnswerId = [
  param("answerId")
    .isInt({min: 1}).withMessage("1 이상의 정수만 가능합니다.")
    .exists().withMessage("answerId는 필수입니다."),
];

export const validateRecordAnswer = [
  ...validateQuestionId,
  ...validateAnswerContent,
  validationErrorMiddleware
];

export const validateEditAnswer = [
  ...validateAnswerId,
  ...validateNewAnswerContent,
  validationErrorMiddleware
];

const validateAnswersFilterQuery = [
  query("filter")
    .optional()
    .isIn(['basic', 'weekly'])
    .withMessage("정렬 기준은 basic 또는 weekly만 가능합니다."),
];

export const validateGetAnsweredQuestions = [...validatePagination, ...validateAnswersFilterQuery, validationErrorMiddleware];
