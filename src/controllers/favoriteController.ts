import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { favoriteService } from "../services/favoriteService.js";
import { UserInfo } from "../services/authService.js";

const validateFavoriteRequest = (userId: number, questionId: number) => {
  if (!userId || isNaN(questionId)) {
    throw new Error("잘못된 요청입니다.");
  }
  return true;
};

export const addFavorite = async (
  req: Request & { user?: UserInfo },
  res: Response,
  next: NextFunction
): Promise<void> => {
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
};

export const removeFavorite = async (
  req: Request & { user?: UserInfo },
  res: Response,
  next: NextFunction
): Promise<void> => {
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
};
