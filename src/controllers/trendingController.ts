import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import trendingService from "../services/trendingService.js";
import { TrendingRequest } from "../middlewares/trendingValidator.js";

export async function getTrendingQuestions(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const request = req as TrendingRequest;
    const trendingQuestions = await trendingService.getTrendingQuestions(
      request.validatedCategoryId,
      request.validatedLimit
    );
    res.status(StatusCodes.OK).json(trendingQuestions);
  } catch (error) {
    next(error);
  }
}

export async function getTrendingPosts(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const request = req as TrendingRequest;
    const trendingPosts = await trendingService.getTrendingPosts(
      request.validatedCategoryId,
      request.validatedLimit
    );
    res.status(StatusCodes.OK).json(trendingPosts);
  } catch (error) {
    next(error);
  }
}
