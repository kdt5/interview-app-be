import { NextFunction, Response, Request } from "express";
import { StatusCodes } from "http-status-codes";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import rankingService from "../services/rankingService.js";

interface RankingsRequest extends AuthRequest {
  query: {
    limit?: string;
  };
}

// TODO: 나의 랭킹

// TODO: 통합 랭킹

// 좋아요 랭킹
export async function getLikesRankings(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const request = req as RankingsRequest;
    const { limit } = request.query;
    const rankings = await rankingService.getLikesCountRankings(Number(limit));
    res.status(StatusCodes.OK).json(rankings);
  } catch (error) {
    next(error);
  }
}

// 답변 랭킹
export async function getAnswersRankings(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const request = req as RankingsRequest;
    const { limit } = request.query;
    const rankings = await rankingService.getAnswerCountRankings(Number(limit));
    res.status(StatusCodes.OK).json(rankings);
  } catch (error) {
    next(error);
  }
}
