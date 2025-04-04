import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { categoryService } from "../services/categoryService.js";

export interface CategoryQueryRequest extends Request {
  query: {
    positionId?: string;
  };
}

export async function getAllCategories(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const request = req as CategoryQueryRequest;
    const positionId = request.query.positionId;
    if (positionId) {
      const categories = await categoryService.getPositionCategories(
        parseInt(positionId)
      );
      if (categories.length === 0) {
        res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "조건에 해당하는 카테고리가 존재하지 않습니다." });
        return;
      }

      res.status(StatusCodes.OK).json(categories);
    } else {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "positionId 파라미터가 필요합니다." });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
}
