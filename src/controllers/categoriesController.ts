import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { categoryService } from "../services/categoryService.js";

interface CategoryQueryParams {
  positionId?: string;
}

export async function getAllCategories(
  req: Request<CategoryQueryParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const positionId = req.query.positionId as string | undefined;
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
