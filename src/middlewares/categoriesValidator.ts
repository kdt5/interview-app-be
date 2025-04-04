import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { CategoryQueryRequest } from "../controllers/categoriesController";

export function validateGetAllCategoriesQuery(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const request = req as CategoryQueryRequest;
  const positionId = request.query.positionId;

  if (positionId && isNaN(parseInt(positionId))) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "positionId는 숫자여야 합니다." });
    return;
  }

  next();
}
