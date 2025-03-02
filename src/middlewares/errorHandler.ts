import { Request, Response, NextFunction } from 'express';
import { AuthError, ValidationError, DuplicateError, CommonError } from '../utils/errors/authError.js';
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
    _next: NextFunction
) => {
    let response: ErrorResponse = {
        message: '서버 오류가 발생했습니다.'
    };
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;

    // 로깅이 필요한 에러인지 확인
    const shouldLog =
        error instanceof CommonError ||
        (error instanceof AuthError && error.errorType === 'SECRET_KEY_NOT_FOUND') ||
        error instanceof PrismaClientKnownRequestError ||
        !(error instanceof AuthError ||
            error instanceof ValidationError ||
            error instanceof DuplicateError);

    // 중요 에러만 로깅, TODO: 로깅 레벨 추가 필요
    if (shouldLog) {
        console.error('[Error]', {
            path: req.path,
            error: error instanceof Error ? (error as CommonError).getInternalMessage?.() || error.message : 'Unknown error',
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
    }

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

    // 특별 보안 에러 처리
    if (error instanceof AuthError && error.errorType === 'SECURITY_RELOGIN_REQUIRED') {
        response = {
            message: error.message,
            code: 'SECURITY_RELOGIN_REQUIRED'
        };
        statusCode = StatusCodes.UNAUTHORIZED;
    }

    res.status(statusCode).json(response);
}; 