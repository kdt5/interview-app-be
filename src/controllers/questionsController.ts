import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { questionService } from "../services/questionService.js";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import { DEFAULT_PAGINATION_OPTIONS } from "../constants/pagination.js";

export interface GetQuestionDetailRequest extends AuthRequest {
  params: {
    questionId: string;
  };
}

export async function getQuestionDetail(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const request = req as GetQuestionDetailRequest;
    const questionId = parseInt(request.params.questionId);
    const question = await questionService.getQuestionById(
      request.user.userId,
      questionId
    );

    await questionService.increaseQuestionViewCount(questionId);

    if (!question) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "존재하지 않는 질문입니다." });
      return;
    }

    res.status(StatusCodes.OK).json(question);
  } catch (error) {
    next(error);
  }
}

export async function getCurrentWeeklyQuestion(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const request = req as AuthRequest;
    const question = await questionService.getCurrentWeeklyQuestion(
      request.user.userId
    );

    if (!question) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "주간 질문이 설정되지 않았습니다." });
      return;
    }

    res.status(StatusCodes.OK).json(question);
  } catch (error) {
    next(error);
  }
}

export interface AddWeeklyQuestionRequest extends Request {
  body: {
    startDate: string;
    questionId: string;
  };
}

export async function addWeeklyQuestion(
  req: AddWeeklyQuestionRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { startDate, questionId } = req.body;

    const weeklyQuestion = await questionService.addWeeklyQuestion(
      parseInt(questionId),
      startDate
    );

    res.status(StatusCodes.CREATED).json(weeklyQuestion);
  } catch (error) {
    next(error);
  }
}

export interface GetQuestionRequest extends AuthRequest {
  query: {
    positionId?: string;
    categoryId?: string;
    limit?: string;
    page?: string;
  };
}

export async function getBasicQuestions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const request = req as GetQuestionRequest;
    const positionId =
      request.query.positionId === undefined
        ? undefined
        : parseInt(request.query.positionId);
    const categoryId =
      request.query.categoryId === undefined
        ? undefined
        : parseInt(request.query.categoryId);
    const limit =
      request.query.limit === undefined
        ? DEFAULT_PAGINATION_OPTIONS.QUESTION.LIMIT
        : parseInt(request.query.limit);
    const page =
      request.query.page === undefined ? 1 : parseInt(request.query.page);

    const questions = await questionService.getQuestions(
      request.user.userId,
      { limit, page },
      {
        positionId,
        categoryId,
      }
    );
    if (questions.length === 0) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "조건에 해당하는 질문이 존재하지 않습니다." });
      return;
    }

    res.status(StatusCodes.OK).json(questions);
  } catch (error) {
    next(error);
  }
}

interface GetWeeklyQuestionsRequest extends AuthRequest {
  query: {
    limit?: string;
    page?: string;
  };
}

export async function getWeeklyQuestions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const request = req as GetWeeklyQuestionsRequest;
    const limit =
      request.query.limit === undefined
        ? DEFAULT_PAGINATION_OPTIONS.QUESTION.LIMIT
        : parseInt(request.query.limit);
    const page =
      request.query.page === undefined ? 1 : parseInt(request.query.page);

    const questions = await questionService.getWeeklyQuestions(
      request.user.userId,
      { limit, page }
    );

    if (questions.length === 0) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "주간 질문 목록을 찾을 수 없습니다." });
      return;
    }

    res.status(StatusCodes.OK).json(questions);
  } catch (error) {
    next(error);
  }
}
