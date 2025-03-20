import { Prisma } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import answerService from "../services/answerService";
import { checkQuestionExists } from "../services/questionService";
import { RequestWithUser } from "../middlewares/authMiddleware";
import { UserInfo } from "../services/authService";

interface RecordAnswerRequest extends RequestWithUser {
  params: {
    "question-id": string;
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
    const questionId = parseInt(req.params["question-id"]);
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
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req as Request & { user: UserInfo }).user.userId;

    const questions = await answerService.getAnsweredQuestions(userId);
    if (!questions) {
      res.status(StatusCodes.NOT_FOUND);
      return;
    }

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
    const answerId = parseInt(req.params["answer-id"]);

    const answer = await answerService.getAnswer(answerId);

    if (!answer) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: "존재하지 않는 답변입니다.",
      });
      return;
    }

    res.status(StatusCodes.OK).json(answer);
  } catch (error) {
    next(error);
  }
}

export async function editAnswer(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const answerId = parseInt(req.params["answer-id"]);
    const editAnswer = String(req.body.newAnswer);

    const answer = await answerService.updateAnswer(answerId, editAnswer);
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
}

export async function deleteAnswer(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const answerId = parseInt(req.params["answer-id"]);

    await answerService.deleteAnswer(answerId);
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
}
