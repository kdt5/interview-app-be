import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

export interface TrendingRequest extends Request {
  validatedCategoryId?: number;
  validatedLimit?: number;
}

export const validateTrendingCategoryId = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const request = req as TrendingRequest;
  const categoryId = request.query.categoryId;

  if (categoryId === undefined) {
    next();
    return;
  }

  const categoryIdNum = Number(categoryId);
  if (isNaN(categoryIdNum) || categoryIdNum < 1) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid category ID" });
    return;
  }

  request.validatedCategoryId = categoryIdNum;
  next();
};

export const validateTrendingLimit = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const request = req as TrendingRequest;
  const limit = request.query.limit;

  if (limit === undefined) {
    request.validatedLimit = 10;
    next();
    return;
  }

  const limitNum = Number(limit);
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "Limit must be between 1 and 50" });
    return;
  }

  request.validatedLimit = limitNum;
  next();
};
