import { Request, Response, NextFunction } from 'express';
import { AuthError, ValidationError, DuplicateError, CommonError } from '../utils/errors/authError';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { StatusCodes } from 'http-status-codes';

interface ErrorResponse {
    message: string;
    code?: string;
}

export const errorHandler = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let response: ErrorResponse = {
        message: '서버 오류가 발생했습니다.'
    };
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;

    // 에러 로깅
    console.error('[Error]', {
        path: req.path,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
    });

    // 커스텀 에러 처리
    if (error instanceof AuthError ||
        error instanceof ValidationError ||
        error instanceof DuplicateError) {
        response = {
            message: error.message,
            code: error.code
        };
        statusCode = error.statusCode;
    }
    // Prisma 에러 처리
    else if (error instanceof PrismaClientKnownRequestError) {
        const commonError = new CommonError("DATABASE_ERROR");
        response = {
            message: commonError.message,
            code: commonError.code
        };
        statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    }
    // 예상치 못한 에러 처리
    else {
        const commonError = new CommonError("UNKNOWN_ERROR");
        response = {
            message: commonError.message,
            code: commonError.code
        };
    }

    res.status(statusCode).json(response);
}; 