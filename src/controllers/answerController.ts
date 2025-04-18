import { Prisma } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import answerService from "../services/answerService.js";
import { questionService } from "../services/questionService.js";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import { GetAllAnswersRequest } from "./questionsController.js";

export interface RecordAnswerRequest extends AuthRequest {
  params: {
    questionId: string;
  };
  body: {
    content: string;
  };
}

export async function recordAnswer(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const request = req as RecordAnswerRequest;
    const { content } = request.body;
    const { questionId } = request.params;
    const userId = request.user.userId;

    const questionExists = await questionService.checkQuestionExists(
      parseInt(questionId)
    );

    if (!questionExists) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: "존재하지 않는 질문입니다.",
      });
      return;
    }

    await answerService.recordAnswer(userId, parseInt(questionId), content);

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
    const request = req as AuthRequest;
    const userId = request.user.userId;

    const answeredQuestions = await answerService.getAnsweredQuestions(userId);

    if (!answeredQuestions) {
      res.status(StatusCodes.NOT_FOUND);
      return;
    }

    const mappedAnsweredQuestions = answeredQuestions.map((answer) => {
      return {
        id: answer.id,
        question: {
          id: answer.question.id,
          title: answer.question.title,
          categories: answer.question.categories.map(
            (category) => category.categoryId
          ),
        },
      };
    });

    res.status(StatusCodes.OK).json(mappedAnsweredQuestions);
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
    const { answerId } = req.params;

    const answer = await answerService.getAnswer(parseInt(answerId));

    await answerService.increaseAnswerViewCount(parseInt(answerId));

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

export interface EditAnswerRequest extends Request {
  params: {
    answerId: string;
  };
  body: {
    newAnswer: string;
  };
}

export async function getAnswers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const request = req as GetAllAnswersRequest;
    const { questionId } = request.params;

    const answers = await answerService.getAnswers(parseInt(questionId));
    if (answers.length === 0) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: "조건에 해당하는 질문 또는 답변이 존재하지 않습니다.",
      });
      return;
    }

    res.status(StatusCodes.OK).json(answers);
  } catch (error) {
    next(error);
  }
}

export async function editAnswer(
  req: EditAnswerRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { answerId } = req.params;
    const editAnswer = req.body.newAnswer;

    const answer = await answerService.updateAnswer(
      parseInt(answerId),
      editAnswer
    );
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

export interface DeleteAnswerRequest extends Request {
  params: {
    answerId: string;
  };
}

export async function deleteAnswer(
  req: DeleteAnswerRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { answerId } = req.params;

    await answerService.deleteAnswer(parseInt(answerId));
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
