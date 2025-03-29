import { Position } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { body } from "express-validator";
import dayjs from "dayjs";

export function validateGetQuestionDetail(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { questionId } = req.params;

  const questionIdRegex = /^[0-9]+$/;
  if (!questionIdRegex.test(questionId)) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "질문 아이디는 숫자만 가능합니다." });
    return;
  }

  next();
}

export function validateGetAllQuestionQuery(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const position = req.query.position as string | undefined;

  if (position && !Object.values(Position).includes(position as Position)) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "직무는 frontend 또는 backend만 가능합니다." });
    return;
  }

  next();
}

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
    return true;
  })
  .withMessage("날짜 형식이 올바르지 않습니다."),
];
