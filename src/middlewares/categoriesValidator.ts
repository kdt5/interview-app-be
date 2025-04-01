import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

export function validateGetAllCategoriesQuery(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const positionId = req.query.positionId as string | undefined;

  if (positionId && isNaN(parseInt(positionId))) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "positionId는 숫자여야 합니다." });
    return;
  }

  next();
}
