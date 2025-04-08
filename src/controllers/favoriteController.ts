import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { favoriteService } from "../services/favoriteService.js";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { AuthRequest } from "../middlewares/authMiddleware.js";

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
    const request = req as AuthRequest;
    const userId = request.user.userId;

    const questions = await favoriteService.getFavoriteQuestions(userId);

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
    const request = req as AuthRequest;
    const userId = request.user.userId;
    const { questionId } = req.params;

    validateFavoriteRequest(userId, parseInt(questionId));

    const status = await favoriteService.getFavoriteQuestionStatus(
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
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const request = req as AuthRequest;
    const { questionId } = request.params;
    const userId = request.user?.userId;

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
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const request = req as AuthRequest;
    const { questionId } = request.params;
    const userId = request.user?.userId;

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
