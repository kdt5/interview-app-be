import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import {
  EditAnswerRequest,
  RecordAnswerRequest,
} from "../controllers/answerController.js";
import { validatePagination } from "./paginationValidator.js";

export function validateRecordAnswer(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const request = req as RecordAnswerRequest;
  const { questionId } = request.params;
  const { content } = request.body;

  const validQuestionId = /^[0-9]+$/.test(questionId);
  const validContent = /^.{1,500}$/.test(content);
  const errors: { field: string; message: string }[] = [];

  if (!validQuestionId) {
    errors.push({
      field: "questionId",
      message: "유효하지 않은 질문 아이디입니다.",
    });
  }

  if (!validContent) {
    errors.push({
      field: "content",
      message: "유효하지 않은 답변입니다.",
    });
  }

  if (errors.length !== 0) {
    res.status(StatusCodes.BAD_REQUEST).json(errors).end();
    return;
  }

  next();
}

export function validateEditAnswer(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const request = req as EditAnswerRequest;
  const { answerId } = request.params;
  const { newAnswer } = request.body;

  const answerIdRegex = /^[0-9]+$/;

  if (!answerIdRegex.test(answerId)) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "답변 아이디는 숫자만 가능합니다." });
    return;
  } else if (!newAnswer) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "빈칸으로 답변 수정이 불가합니다." });
    return;
  }

  next();
}

interface AnswerIdRequest extends Request {
  params: {
    answerId: string;
  };
}

export function validateAnswerId(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const request = req as AnswerIdRequest;
  const { answerId } = request.params;

  const answerIdRegex = /^[0-9]+$/;

  if (!answerIdRegex.test(answerId)) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "답변 아이디는 숫자만 가능합니다." });
    return;
  }

  next();
}

export const validateGetAnsweredQuestions = [...validatePagination];
