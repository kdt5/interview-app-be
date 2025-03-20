import { Position } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

export function validateGetAllCategoriesQuery(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const position = req.query.position as string | undefined;

  if (position && !Object.values(Position).includes(position as Position)) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "직무는 frontend 또는 backend만 가능합니다." });
    return;
  }

  next();
}
