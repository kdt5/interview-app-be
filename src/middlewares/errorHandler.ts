import { Request, Response } from "express";
import {
  AuthError,
  ValidationError,
  DuplicateError,
} from "../constants/errors/authError.js";
import { CommonError } from "../constants/errors/commonError.js";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { StatusCodes } from "http-status-codes";

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
) => {
  let statusCode: StatusCodes;

  // 커스텀 에러 처리
  if (error instanceof ValidationError || error instanceof DuplicateError) {
    statusCode = error.statusCode;
  } else if (error instanceof AuthError) {
    statusCode = error.statusCode;

    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
  }
  // Prisma 에러 처리
  else if (error instanceof PrismaClientKnownRequestError) {
    const commonError = new CommonError("DATABASE_ERROR");
    statusCode = commonError.statusCode;

    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
  }
  // 예상치 못한 에러 처리
  else {
    const commonError = new CommonError("UNKNOWN_ERROR");
    statusCode = commonError.statusCode;

    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
  }

  res.status(statusCode).json({ error: error.message });
};
