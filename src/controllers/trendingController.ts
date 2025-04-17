import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import trendingService from "../services/trendingService";

interface TrendingQuestionsRequest extends Request {
  query: {
    categoryId?: string;
    limit?: string;
  };
}

export async function getTrendingQuestions(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const request = req as TrendingQuestionsRequest;
    const { categoryId, limit } = request.query;
    const trendingQuestions = await trendingService.getTrendingQuestions(
      categoryId ? parseInt(categoryId) : undefined,
      limit ? parseInt(limit) : undefined
    );
    res.status(StatusCodes.OK).json(trendingQuestions);
  } catch (error) {
    next(error);
  }
}

interface TrendingPostsRequest extends Request {
  query: {
    categoryId?: string;
    limit?: string;
  };
}
export async function getTrendingPosts(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const request = req as TrendingPostsRequest;
    const { categoryId, limit } = request.query;
    const trendingPosts = await trendingService.getTrendingPosts(
      categoryId ? parseInt(categoryId) : undefined,
      limit ? parseInt(limit) : undefined
    );
    res.status(StatusCodes.OK).json(trendingPosts);
  } catch (error) {
    next(error);
  }
}
