import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { getPositionCategories } from "../services/categoryService";
import { Position } from "@prisma/client";

interface CategoryQueryParams {
  position?: Position;
}

export async function getAllCategories(
  req: Request<CategoryQueryParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const position = req.query.position as Position;

    const categories = await getPositionCategories(position);
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
