import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import {
  favoriteService,
  getFavoriteQuestions,
  getFavoriteQuestionStatus,
} from "../services/favoriteService.js";
import { UserInfo } from "../services/authService.js";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

function validateFavoriteRequest(userId: number, questionId: number) {
  if (!userId || isNaN(questionId)) {
    throw new Error("잘못된 요청입니다.");
  }
  return true;
}

export async function getFavorites(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req as Request & { user: UserInfo }).user.userId;

    const questions = await getFavoriteQuestions(userId);

    if (!questions) {
      res.status(StatusCodes.NOT_FOUND);
      return;
    }

    res.status(StatusCodes.OK).json(questions);
  } catch (error) {
    next(error);
  }
}

export async function getFavoriteStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req as Request & { user: UserInfo }).user.userId;
    const questionId = parseInt(req.params.id);

    validateFavoriteRequest(userId, questionId);

    const status = await getFavoriteQuestionStatus(userId, questionId);

    if (status) {
      res.status(StatusCodes.OK).json(true);
    }
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(StatusCodes.NOT_FOUND).json(false);
      return;
    }

    next(error);
  }
}

export async function addFavorite(
  req: Request & { user?: UserInfo },
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const questionId = parseInt(id);
    const userId = req.user?.userId;

    if (!userId) return;

    validateFavoriteRequest(userId, questionId);

    const favorite = await favoriteService.createFavorite(userId, questionId);

    res.status(StatusCodes.CREATED).json({
      message: "추가되었습니다.",
      favorite,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "잘못된 요청입니다.") {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: error.message,
      });
    } else {
      next(error);
    }
  }
}

export async function removeFavorite(
  req: Request & { user?: UserInfo },
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const questionId = parseInt(id);
    const userId = req.user?.userId;

    if (!userId) return;

    validateFavoriteRequest(userId, questionId);

    await favoriteService.removeFavorite(userId, questionId);

    res.status(StatusCodes.OK).json({
      message: "삭제되었습니다.",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "잘못된 요청입니다.") {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: error.message,
      });
    } else {
      next(error);
    }
  }
}
