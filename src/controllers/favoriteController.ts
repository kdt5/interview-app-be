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
    const { questionId } = req.params;

    validateFavoriteRequest(userId, parseInt(questionId));

    const status = await getFavoriteQuestionStatus(
      userId,
      parseInt(questionId)
    );

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
    const { questionId } = req.params;
    const userId = req.user?.userId;

    if (!userId) return;

    validateFavoriteRequest(userId, parseInt(questionId));

    const favorite = await favoriteService.createFavorite(
      userId,
      parseInt(questionId)
    );

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
    const { questionId } = req.params;
    const userId = req.user?.userId;

    if (!userId) return;

    validateFavoriteRequest(userId, parseInt(questionId));

    await favoriteService.removeFavorite(userId, parseInt(questionId));

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
