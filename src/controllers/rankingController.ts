import { NextFunction, Response, Request } from "express";
import { StatusCodes } from "http-status-codes";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import rankingService from "../services/rankingService.js";

export async function getMyRankings(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const request = req as AuthRequest;
    const rankings = await rankingService.getMyRankings(
      Number(request.user.userId)
    );
    res.status(StatusCodes.OK).json(rankings);
  } catch (error) {
    next(error);
  }
}

export async function getRankings(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rankings = await rankingService.getRankings();
    res.status(StatusCodes.OK).json(rankings);
  } catch (error) {
    next(error);
  }
}

export async function getLikesRankings(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rankings = await rankingService.getLikesRankings();
    res.status(StatusCodes.OK).json(rankings);
  } catch (error) {
    next(error);
  }
}

export async function getAnswersRankings(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rankings = await rankingService.getAnswersRankings();
    res.status(StatusCodes.OK).json(rankings);
  } catch (error) {
    next(error);
  }
}
