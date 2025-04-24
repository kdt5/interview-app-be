import { NextFunction, Response, Request } from "express";
import { StatusCodes } from "http-status-codes";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import rankingService, { RankingUser } from "../services/rankingService.js";

interface RankingsRequest extends AuthRequest {
  query: {
    limit?: string;
  };
}

// TODO: 나의 랭킹

// TODO: 통합 랭킹

// 좋아요 랭킹
export async function getLikeCountRankings(
  req: Request,
  res: Response<RankingUser[]>,
  next: NextFunction
): Promise<void> {
  try {
    const request = req as RankingsRequest;
    const { limit } = request.query;
    const limitValue = limit ? Number(limit) : 100;
    const rankings = await rankingService.getLikeCountRankings(limitValue);
    res.status(StatusCodes.OK).json(rankings);
  } catch (error) {
    next(error);
  }
}

// 답변 랭킹
export async function getAnswerCountRankings(
  req: Request,
  res: Response<RankingUser[]>,
  next: NextFunction
): Promise<void> {
  try {
    const request = req as RankingsRequest;
    const { limit } = request.query;
    const limitValue = limit ? Number(limit) : 100;
    const rankings = await rankingService.getAnswerCountRankings(limitValue);
    res.status(StatusCodes.OK).json(rankings);
  } catch (error) {
    next(error);
  }
}
