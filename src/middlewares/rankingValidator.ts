import { Response, NextFunction, Request } from "express";
import { StatusCodes } from "http-status-codes";
import { AuthRequest } from "./authMiddleware.js";

export interface RankingsRequest extends AuthRequest {
  validatedLimit?: number;
}

export const validateRankingLimit = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const request = req as RankingsRequest;
  const limit = Number(request.query.limit);
  const limitValue = isNaN(limit) ? 100 : limit;

  if (limitValue < 1 || limitValue > 100) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "Limit must be between 1 and 100" });
    return;
  }

  request.validatedLimit = limitValue;
  next();
};
