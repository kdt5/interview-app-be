import jwt, { JwtPayload, JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import prisma from '../lib/prisma';
import { Request, Response, NextFunction } from 'express';
import { UserInfo } from '../services/auth-service';

export interface RequestWithUser extends Request {
    user?: UserInfo;
}

const AUTH_ERROR_MESSAGES = {
    UNAUTHORIZED: '인증이 필요합니다.',
    INVALID_TOKEN: '유효하지 않은 토큰입니다.',
    TOKEN_EXPIRED: '토큰이 만료되었습니다.',
    FORBIDDEN: '접근 권한이 없습니다.'
};

export class AuthenticationError extends Error {
    constructor(public statusCode: number, message: string) {
        super(message);
        this.name = 'AuthenticationError';
    }
}

const authMiddleware = {
    authenticate: async (
        req: RequestWithUser,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const token = authMiddleware.extractTokenFromHeader(req);
            const secret = authMiddleware.getJwtSecret();
            const user = await authMiddleware.validateTokenAndGetUser(token, secret);

            req.user = { email: user.email, nickName: user.nickName };
            next();
        } catch (error) {
            return handleAuthError(error, res);
        }
    },

    extractTokenFromHeader(req: RequestWithUser): string {
        const authHeader = req.headers.authorization;
        if (!authHeader?.split(' ')[1]) {
            throw new AuthenticationError(
                StatusCodes.UNAUTHORIZED,
                AUTH_ERROR_MESSAGES.UNAUTHORIZED
            );
        }
        return authHeader.split(' ')[1];
    },

    getJwtSecret(): string {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not defined');
        }
        return secret;
    },

    async validateTokenAndGetUser(token: string, secret: string) {
        try {
            const decoded = jwt.verify(token, secret) as JwtPayload;
            if (!decoded || typeof decoded.email !== 'string') {
                throw new AuthenticationError(StatusCodes.UNAUTHORIZED, AUTH_ERROR_MESSAGES.INVALID_TOKEN);
            }

            const user = await prisma.user.findUnique({
                where: { email: decoded.email },
                select: { email: true, nickName: true }
            });

            if (!user) {
                throw new AuthenticationError(StatusCodes.UNAUTHORIZED, AUTH_ERROR_MESSAGES.UNAUTHORIZED);
            }

            return user;
        } catch (error) {
            if (error instanceof TokenExpiredError) {
                throw new AuthenticationError(StatusCodes.UNAUTHORIZED, AUTH_ERROR_MESSAGES.TOKEN_EXPIRED);
            }
            if (error instanceof JsonWebTokenError) {
                throw new AuthenticationError(StatusCodes.UNAUTHORIZED, AUTH_ERROR_MESSAGES.INVALID_TOKEN);
            }
            throw new AuthenticationError(StatusCodes.UNAUTHORIZED, AUTH_ERROR_MESSAGES.UNAUTHORIZED);
        }
    }
};

function handleAuthError(error: unknown, res: Response): Response {
    if (error instanceof AuthenticationError) {
        return res.status(error.statusCode).json({
            message: error.message
        });
    }

    console.error("Unexpected authentication error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "서버 오류 발생"
    });
}

export default authMiddleware;
