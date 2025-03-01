import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { Request, Response, NextFunction } from 'express';
import { UserInfo, refreshTokens } from '../services/authService.js';
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
            const token = authMiddleware.extractTokenFromCookie(req);
            const secret = authMiddleware.getJwtSecret();

            try {
                const user = await authMiddleware.validateTokenAndGetUser(token, secret);
                req.user = { email: user.email, nickName: user.nickName };
                next();
            } catch (error) {
                // 액세스 토큰이 만료된 경우에만 리프레시 토큰 시도
                if (error instanceof AuthError && error.errorType === "TOKEN_EXPIRED") {
                    const refreshToken = req.cookies?.refreshToken;

                    if (!refreshToken) {
                        throw new AuthError("REFRESH_TOKEN_REQUIRED");
                    }

                    try {
                        // 리프레시 토큰으로 새 토큰 발급
                        const tokens = await refreshTokens(refreshToken);

                        // 새 토큰으로 쿠키 업데이트
                        authMiddleware.setRefreshTokenCookie(res, tokens.refreshToken);

                        // 새 액세스 토큰으로 사용자 정보 가져오기
                        const user = await authMiddleware.validateTokenAndGetUser(tokens.accessToken, secret);
                        req.user = { email: user.email, nickName: user.nickName };

                        // 새 액세스 토큰을 응답 헤더에 추가
                        res.setHeader('X-New-Access-Token', tokens.accessToken);

                        next();
                    } catch (refreshError) {
                        // 리프레시 토큰 갱신 실패
                        next(refreshError);
                    }
                } else {
                    // 다른 인증 오류
                    next(error);
                }
            }
        } catch (error) {
            next(error);
        }
    },

    extractTokenFromCookie(req: RequestWithUser): string {
        const token = req.cookies.accessToken;
        if (!token) {
            throw new AuthError("UNAUTHORIZED");
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
    },

    // 리프레시 토큰 쿠키 설정 함수
    setRefreshTokenCookie(res: Response, refreshToken: string): void {
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
            sameSite: 'strict'
        });
    },

    // 리프레시 토큰 쿠키 삭제 함수
    clearRefreshTokenCookie(res: Response): void {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
    },

    // 액세스 토큰 쿠키 설정 함수
    setAccessTokenCookie(res: Response, accessToken: string): void {
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 1000, // 1시간
            sameSite: 'strict'
        });
    },

    // 액세스 토큰 쿠키 삭제 함수
    clearAccessTokenCookie(res: Response): void {
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
    }
};

export default authMiddleware;
