import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import {
  getQuestionById,
  getWeeklyQuestion,
  getAllQuestionsWithCategories,
} from "../services/questionService.js";
import { Position } from "@prisma/client";

export async function getQuestionDetail(
  req: Request<{ questionId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { questionId } = req.params;
    const question = await getQuestionById(parseInt(questionId));

    if (!question) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "존재하지 않는 질문입니다." });
      return;
    }

    res.status(StatusCodes.OK).json({
      questionDetail: {
        id: question.id,
        title: question.title,
        content: question.content,
        isWeekly: question.isWeekly,
        createdAt: question.createdAt,
        categories: question.categories.map((qc) => qc.category.name),
      },
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
}

export async function getWeeklyQuestionDetail(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const question = await getWeeklyQuestion();

    if (!question) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "주간 질문이 존재하지 않습니다." });
      return;
    }

    res.status(StatusCodes.OK).json({
      questionDetail: {
        id: question.id,
        title: question.title,
        content: question.content,
        isWeekly: question.isWeekly,
        createdAt: question.createdAt,
        categories: question.categories.map((qc) => qc.category.name),
      },
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
}

interface QuestionQueryParams {
  position?: Position;
  categoryId?: string;
}

export async function getAllQuestions(
  req: Request<QuestionQueryParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const categoryId = req.query.categoryId as string | undefined;
    const position = req.query.position as Position | undefined;

    const parsedCategoryId = categoryId ? parseInt(categoryId) : undefined;
    const questions = await getAllQuestionsWithCategories(
      position,
      parsedCategoryId
    );
    if (questions.length === 0) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "조건에 해당하는 질문이 존재하지 않습니다." });
      return;
    }

    res.status(StatusCodes.OK).json(questions);
  } catch (error) {
    console.error(error);
    next(error);
  }
}
