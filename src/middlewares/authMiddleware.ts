import jwt, { JwtPayload, JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
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
            next(error);
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

export default authMiddleware;
