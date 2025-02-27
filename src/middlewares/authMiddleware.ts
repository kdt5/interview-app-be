import jwt, { JwtPayload, JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import prisma from '../lib/prisma';
import { Request, Response, NextFunction } from 'express';
import { UserInfo } from '../services/authService';
import { AuthError } from '../utils/errors/authError';

export interface RequestWithUser extends Request {
    user?: UserInfo;
}

const authMiddleware = {
    authenticate: async (
        req: RequestWithUser,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const token = authMiddleware.extractTokenFromHeader(req);
            const secret = authMiddleware.getJwtSecret();
            const user = await authMiddleware.validateTokenAndGetUser(token, secret);

            req.user = { email: user.email, nickName: user.nickName };
            next();
        } catch (error) {
            handleAuthError(error, res);
        }
    },

    extractTokenFromHeader(req: RequestWithUser): string {
        const authHeader = req.headers.authorization;
        if (!authHeader?.split(' ')[1]) {
            throw new AuthError("UNAUTHORIZED");
        }
        return authHeader.split(' ')[1];
    },

    getJwtSecret(): string {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new AuthError("SECRET_KEY_NOT_FOUND");
        }
        return secret;
    },

    async validateTokenAndGetUser(token: string, secret: string) {
        try {
            const decoded = jwt.verify(token, secret) as JwtPayload;
            if (!decoded || typeof decoded.email !== 'string') {
                throw new AuthError("INVALID_TOKEN");
            }

            const user = await prisma.user.findUnique({
                where: { email: decoded.email },
                select: { email: true, nickName: true }
            });

            if (!user) {
                throw new AuthError("UNAUTHORIZED");
            }

            return user;
        } catch (error) {
            if (error instanceof TokenExpiredError) {
                throw new AuthError("TOKEN_EXPIRED");
            }
            if (error instanceof JsonWebTokenError) {
                throw new AuthError("INVALID_TOKEN");
            }
            throw new AuthError("UNAUTHORIZED");
        }
    }
};

function handleAuthError(error: unknown, res: Response): Response {
    if (error instanceof AuthError) {
        return res.status(error.statusCode).json({
            message: error.message
        });
    }

    if (error instanceof Error) {
        console.error("Unexpected authentication error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "서버 오류 발생"
        });
    }

    console.error("Unexpected authentication error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "서버 오류 발생"
    });
}

export default authMiddleware;
