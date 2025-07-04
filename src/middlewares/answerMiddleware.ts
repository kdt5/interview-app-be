import prisma from "../lib/prisma.js";
import { NextFunction, Request, Response } from "express";
import { UserInfo } from "../services/authService.js";
import { StatusCodes } from "http-status-codes";

const answersMiddleware = {
  checkAnswerOwnership: async (
    req: Request & { user?: UserInfo },
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { answerId } = req.params;
    const user = req.user as UserInfo;
    const userId = user.userId;

    try {
      const answer = await prisma.answer.findUnique({
        where: { id: parseInt(answerId) },
        select: { userId: true },
      });

      if (!answer) {
        res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "조건에 해당하는 답변이 존재하지 않습니다." });
        return;
      }

      if (answer.userId !== userId) {
        res
          .status(StatusCodes.FORBIDDEN)
          .json({ message: "다른 사용자의 답변은 접근 불가합니다." });
        return;
      }

      next();
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  checkPublicAnswerOwnership: async (
    req: Request & { user?: UserInfo },
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { answerId } = req.params;
    const user = req.user as UserInfo;
    const userId = user.userId;

    try {
      const answer = await prisma.answer.findUnique({
        where: { id: parseInt(answerId) },
        select: { userId: true, visibility: true },
      });

      if (!answer) {
        res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "조건에 해당하는 답변이 존재하지 않습니다." });
        return;
      }

      if (answer.userId !== userId && answer.visibility === false) {
        res
          .status(StatusCodes.FORBIDDEN)
          .json({ message: "비공개 답변은 접근 불가합니다." });
        return;
      }

      next();
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
};

export default answersMiddleware;
