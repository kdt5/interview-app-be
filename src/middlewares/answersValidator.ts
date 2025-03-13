import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

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
