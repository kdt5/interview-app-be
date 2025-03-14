import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

export function validateRecordAnswer(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { questionId } = req.params;
  const { content } = req.body;

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

export const validateEditAnswer = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { id } = req.params;
  const { newAnswer } = req.body;

  const answerIdRegex = /^[0-9]+$/;

  if (!answerIdRegex.test(id)) {
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
};

export const validateAnswerId = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { id } = req.params;

  const answerIdRegex = /^[0-9]+$/;

  if (!answerIdRegex.test(id)) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "답변 아이디는 숫자만 가능합니다." });
    return;
  }

  next();
};
