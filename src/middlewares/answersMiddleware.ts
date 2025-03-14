import prisma from "../lib/prisma";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { UserInfo } from "../services/authService";

export const checkAnswerOwnership: RequestHandler = async (
  req: Request & { user?: UserInfo },
  res: Response,
  next: NextFunction
): Promise<void> => {
  const answerId = parseInt(req.params.id);
  const user = req.user;
  let userId;

  if (!user) {
    res.status(401).json({ message: "인증이 필요합니다." });
    return;
  } else {
    userId = user.userId;
  }

  try {
    const answer = await prisma.answer.findUnique({
      where: { id: answerId },
      select: { userId: true },
    });

    if (!answer) {
      res.status(404).json({ message: "조건에 해당하는 답변이 존재하지 않습니다." });
      return;
    }

    if (answer.userId !== userId) {
      res
        .status(403)
        .json({ message: "다른 사용자의 답변은 접근 불가합니다." });
      return;
    }

    next();
  } catch (error) {
    console.log(error);
    next(error);
  }
};
