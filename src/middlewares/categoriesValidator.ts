import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { CategoryQueryRequest } from "../controllers/categoriesController.js";

export function validateGetCategories(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const request = req as CategoryQueryRequest;

  if (request.query.positionId === undefined) {
    next();
    return;
  }

  const positionId = parseInt(request.query.positionId);

  if (isNaN(positionId)) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "positionId는 숫자여야 합니다." });
    return;
  }

  next();
}
