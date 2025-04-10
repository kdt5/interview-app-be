/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { favoriteService } from "../services/favoriteService.js";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import { FavoriteTargetType } from "@prisma/client";

export async function getFavorites(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const request = req as AuthRequest;
    const userId = request.user.userId;
    const targetType =
      req.params.targetType.toUpperCase() as FavoriteTargetType;

    const results = await favoriteService.getFavorites(userId, targetType);

    if (!results) {
      res.status(StatusCodes.NOT_FOUND);
      return;
    }

    res.status(StatusCodes.OK).json(results);
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
    const targetType =
      req.params.targetType.toUpperCase() as FavoriteTargetType;
    const targetId = parseInt(req.params.targetId);

    const status = await favoriteService.getFavoriteStatus(
      userId,
      targetType,
      targetId
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
    const userId = request.user?.userId;
    const targetType =
      req.params.targetType.toUpperCase() as FavoriteTargetType;
    const targetId = parseInt(req.params.targetId);

    if (!userId) return;

    const favorite = await favoriteService.createFavorite(
      userId,
      targetType,
      targetId
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
    const userId = request.user?.userId;
    const targetType =
      req.params.targetType.toUpperCase() as FavoriteTargetType;
    const targetId = parseInt(req.params.targetId);

    if (!userId) return;

    await favoriteService.removeFavorite(userId, targetType, targetId);

    res.status(StatusCodes.NO_CONTENT).send();
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
