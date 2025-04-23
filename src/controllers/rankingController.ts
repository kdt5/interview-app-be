import { NextFunction, Response, Request } from "express";
import { StatusCodes } from "http-status-codes";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import rankingService from "../services/rankingService.js";
import { RankingsRequest } from "../middlewares/rankingValidator.js";

// 나의 랭킹
export async function getMyRankings(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const request = req as AuthRequest;
    const { userId } = request.user;
    const userRanking = await rankingService.getUserRanking(userId);
    if (!userRanking) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "User ranking not found" });
      return;
    }
    res.status(StatusCodes.OK).json(userRanking);
  } catch (error) {
    next(error);
  }
}

// 통합 랭킹
export async function getTotalRankings(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const request = req as RankingsRequest;
    const rankings = await rankingService.getTotalRankings(
      request.validatedLimit
    );
    res.status(StatusCodes.OK).json(rankings);
  } catch (error) {
    next(error);
  }
}

// 좋아요 랭킹
export async function getLikesCountRankings(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const request = req as RankingsRequest;
    const rankings = await rankingService.getLikesCountRankings(
      request.validatedLimit
    );
    res.status(StatusCodes.OK).json(rankings);
  } catch (error) {
    next(error);
  }
}

// 답변 랭킹
export async function getAnswersCountRankings(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const request = req as RankingsRequest;
    const rankings = await rankingService.getAnswerCountRankings(
      request.validatedLimit
    );
    res.status(StatusCodes.OK).json(rankings);
  } catch (error) {
    next(error);
  }
}
