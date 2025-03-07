import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { removeFavorite, createFavorite } from "../services/favoriteService.js";
import prisma from "../lib/prisma.js";

interface AddFavoritesRequest extends Request {
  body: {
    userId: number;
  };
  params: {
    id: string;
  };
}

const validateFavoriteRequest = (userId: number, questionId: number) => {
  if (!userId || isNaN(questionId)) {
    return false;
  }
  return true;
};

export const addFavorites = async (
  req: AddFavoritesRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const questionId = parseInt(id);
    const { userId } = req.body;

    if (!validateFavoriteRequest(userId, questionId)) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "잘못된 요청입니다.",
      });
      return;
    }

    const favorite = await createFavorite(userId, questionId);

    res.status(StatusCodes.CREATED).json({
      message: "추가되었습니다.",
      favorite,
    });
  } catch (error) {
    next(error);
  }
};

export const removeFavorites = async (
  req: AddFavoritesRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const questionId = parseInt(id);
    const { userId } = req.body;

    const favorite = await prisma.favorite.findFirst({
      where: {
        userId: userId,
        questionId: questionId,
      },
    });

    console.log(favorite);

    if (!validateFavoriteRequest(userId, questionId)) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "잘못된 요청입니다.",
      });
      return;
    }

    const existingFavorite = await prisma.favorite.findFirst({
      where: {
        userId: userId,
        questionId: questionId,
      },
    });

    if (!existingFavorite) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: "즐겨찾기가 존재하지 않습니다.",
      });
      return;
    }

    await removeFavorite(userId, questionId);

    res.status(StatusCodes.OK).json({
      message: "삭제되었습니다.",
    });
  } catch (error) {
    next(error);
  }
};
