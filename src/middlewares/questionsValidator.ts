import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { body, param } from "express-validator";
import dayjs from "dayjs";
import prisma from "../lib/prisma.js";

export const validateQuestionId = [
  param("questionId")
    .exists()
    .isInt({ min: 1 })
    .withMessage("질문 아이디는 1 이상의 정수만 가능합니다."),
]

export async function validateGetAllQuestionQuery(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const positionId = req.query.positionId as string | undefined;

  if (positionId) {
    const positionIdNum = parseInt(positionId);
    if (isNaN(positionIdNum)) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "직무 ID는 숫자만 가능합니다." });
      return;
    }

    const position = await prisma.position.findUnique({
      where: { id: positionIdNum },
    });

    if (!position) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "유효하지 않은 직무입니다." });
      return;
    }
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
      if (!dayjs(value).isAfter(dayjs())) {
        throw new Error("시작일은 현재 날짜 이후여야 합니다.");
      }
      return true;
    }),
];
