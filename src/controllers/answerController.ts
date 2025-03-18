import { Prisma } from "@prisma/client";
import { Request, Response, NextFunction, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import answerService from "../services/answerService";
import { checkQuestionExists } from "../services/questionService";
import authMiddleware, { RequestWithUser } from "../middlewares/authMiddleware";
import { UserInfo } from "../services/authService";

interface RecordAnswerRequest extends RequestWithUser {
  params: {
    questionId: string;
  };
  body: {
    content: string;
  };
}

export async function recordAnswer(
  req: RecordAnswerRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { content } = req.body;
    const questionId = parseInt(req.params.questionId);
    const userId = req.user.userId;

    const questionExists = await checkQuestionExists(questionId);

    if (!questionExists) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: "존재하지 않는 질문입니다.",
      });
      return;
    }

    answerService.recordAnswer(userId, questionId, content);

    res.status(StatusCodes.CREATED).end();
  } catch (error) {
    next(error);
  }
}

export async function getAnsweredQuestions(
  req: Request & { user?: UserInfo },
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = authMiddleware.extractTokenFromCookie(req);
    const secret = authMiddleware.getJwtSecret();
    let userId;

    try {
      const user = await authMiddleware.validateTokenAndGetUser(
        token,
        secret
      );

      userId = user.userId;
    } catch (error) {
      next(error);
    }

    if(!userId){
      res.status(StatusCodes.UNAUTHORIZED);
      return;
    }

    const questions = await answerService.getAnsweredQuestions(userId);
    if(!questions){
      res.status(StatusCodes.NOT_FOUND);
      return;
    }

    console.log(questions);
    console.log(typeof questions);

    res.status(StatusCodes.OK).json(questions);

  } catch (error) {
    next(error);
  }
}

export async function getAnswer(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const answerId = parseInt(req.params.id);

    const answer = await answerService.getAnswer(answerId);

    if(!answer){
      res.status(StatusCodes.NOT_FOUND).json({
        message: "존재하지 않는 질문입니다.",
      });
      return;
    }

    res.status(StatusCodes.OK).json(answer);
  } catch (error) {
    next(error);
  }
}

export const editAnswer: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const editAnswer = String(req.body.newAnswer);

    const answer = await answerService.updateAnswer(id, editAnswer);
    res.status(StatusCodes.OK).json(answer);
  } catch (error) {
    console.error(error);
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "조건에 해당하는 답변이 존재하지 않습니다." });
    } else {
      next(error);
    }
  }
};

export const deleteAnswer: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id);

    await answerService.deleteAnswer(id);
    res.status(StatusCodes.NO_CONTENT).json();
  } catch (error) {
    console.error(error);
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "조건에 해당하는 답변이 존재하지 않습니다." });
    } else {
      next(error);
    }
  }
};
