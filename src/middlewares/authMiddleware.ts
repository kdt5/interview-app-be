import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { Request, Response, NextFunction } from 'express';
import { UserInfo } from '../services/authService.js';
import { AuthError } from '../utils/errors/authError.js';

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
            next(error);
        }
    },

    extractTokenFromHeader(req: RequestWithUser): string {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new AuthError("UNAUTHORIZED");
        }

        const [scheme, token] = authHeader.split(' ');

        if (scheme !== 'Bearer' || !token) {
            throw new AuthError("INVALID_AUTH_SCHEME");
        }

        return token;
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
            if (error instanceof Error && error.name === 'TokenExpiredError') {
                throw new AuthError("TOKEN_EXPIRED");
            }
            if (error instanceof Error && error.name === 'JsonWebTokenError') {
                throw new AuthError("INVALID_TOKEN");
            }
            throw new AuthError("UNAUTHORIZED");
        }
    }
};

export default authMiddleware;
