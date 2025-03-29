import { Request, Response, NextFunction, RequestHandler } from "express";
import { validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";

export const validationErrorMiddleware: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
    return;
  }

  next();
};
