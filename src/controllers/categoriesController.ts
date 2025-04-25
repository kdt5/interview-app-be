import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { categoryService } from "../services/categoryService.js";

export interface CategoryQueryRequest extends Request {
  query: {
    positionId?: string;
  };
}

export async function getCategories(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const request = req as CategoryQueryRequest;
    const positionId = request.query.positionId
      ? parseInt(request.query.positionId)
      : undefined;
    const categories = await categoryService.getCategories(positionId);

    if (categories.length === 0) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "조건에 해당하는 카테고리가 존재하지 않습니다." });
      return;
    }

    res.status(StatusCodes.OK).json(categories);
  } catch (error) {
    console.error(error);
    next(error);
  }
}
