import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { Request, Response, NextFunction } from "express";
import { UserInfo, refreshTokens } from "../services/authService.js";
import { AuthError } from "../constants/errors/authError.js";

export interface RequestWithUser extends Request {
  user: UserInfo;
}

export const ACCESS_TOKEN_EXPIRY = 15; // 15분 (분 단위)
export const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60; // 7일 (분 단위)

const authMiddleware = {
  authenticate: async (
    req: Request & { user?: UserInfo },
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const token = authMiddleware.extractTokenFromCookie(req);
      const secret = authMiddleware.getJwtSecret();

      try {
        const user = await authMiddleware.validateTokenAndGetUser(
          token,
          secret
        );
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
            // 토큰 순환 메서드 사용
            const { user } = await authMiddleware.rotateTokens(
              refreshToken,
              res
            );
            req.user = user;
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

  extractTokenFromCookie(req: Request): string {
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
      if (!decoded || typeof decoded.email !== "string") {
        throw new AuthError("INVALID_TOKEN");
      }

      const user = await prisma.user.findUnique({
        where: { email: decoded.email },
        select: { email: true, nickName: true },
      });

      if (!user) {
        throw new AuthError("UNAUTHORIZED");
      }

      return user;
    } catch (error) {
      if (error instanceof Error && error.name === "TokenExpiredError") {
        throw new AuthError("TOKEN_EXPIRED");
      }
      if (error instanceof Error && error.name === "JsonWebTokenError") {
        throw new AuthError("INVALID_TOKEN");
      }
      throw new AuthError("UNAUTHORIZED");
    }
  },

  // 리프레시 토큰 쿠키 설정 함수
  setRefreshTokenCookie(res: Response, refreshToken: string): void {
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: REFRESH_TOKEN_EXPIRY * 60 * 1000,
      sameSite: "strict",
    });
  },

  // 리프레시 토큰 쿠키 삭제 함수
  clearRefreshTokenCookie(res: Response): void {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
  },

  // 액세스 토큰 쿠키 설정 함수
  setAccessTokenCookie(res: Response, accessToken: string): void {
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: ACCESS_TOKEN_EXPIRY * 60 * 1000,
      sameSite: "strict",
    });
  },

  // 액세스 토큰 쿠키 삭제 함수
  clearAccessTokenCookie(res: Response): void {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
  },

  // 토큰 순환 메서드: 리프레시 토큰을 사용하여 새 액세스 토큰과 리프레시 토큰을 발급
  async rotateTokens(
    refreshToken: string,
    res: Response
  ): Promise<{
    accessToken: string;
    user: UserInfo;
  }> {
    try {
      // 리프레시 토큰 검증 및 새 토큰 발급
      const tokens = await refreshTokens(refreshToken);

      // 새 토큰을 쿠키에 설정
      this.setAccessTokenCookie(res, tokens.accessToken);
      this.setRefreshTokenCookie(res, tokens.refreshToken);

      // 새 액세스 토큰으로 사용자 정보 가져오기
      const secret = this.getJwtSecret();
      const user = await this.validateTokenAndGetUser(
        tokens.accessToken,
        secret
      );

      return {
        accessToken: tokens.accessToken,
        user: { email: user.email, nickName: user.nickName },
      };
    } catch (error) {
      // 리프레시 토큰 재사용 감지 로직 추가
      if (error instanceof AuthError) {
        if (error.errorType === "INVALID_REFRESH_TOKEN") {
          // 잠재적 토큰 도난 감지 - 해당 사용자의 모든 리프레시 토큰 무효화
          await this.revokeAllUserTokens(refreshToken);
        }
        // TOKEN_EXPIRED는 해당 토큰만 삭제 (이미 refreshTokens 함수에서 처리됨)
        // 다른 기기의 세션은 유지
      }
      throw error;
    }
  },

  // 리프레시 토큰으로부터 사용자 ID를 추출하여 모든 토큰 무효화
  async revokeAllUserTokens(refreshToken: string): Promise<void> {
    try {
      const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
      if (!refreshTokenSecret) {
        throw new AuthError("SECRET_KEY_NOT_FOUND");
      }

      // 토큰에서 사용자 정보 추출 시도
      const decoded = jwt.verify(
        refreshToken,
        refreshTokenSecret
      ) as JwtPayload;
      if (!decoded || typeof decoded.email !== "string") {
        return; // 유효하지 않은 토큰이면 조용히 반환
      }

      // 사용자 조회
      const user = await prisma.user.findUnique({
        where: { email: decoded.email },
      });

      if (user) {
        // 해당 사용자의 모든 리프레시 토큰 삭제
        await prisma.refreshToken.deleteMany({
          where: { userId: user.id },
        });

        // 선택적: 보안 이벤트 로깅
        console.warn(
          `Security alert: Detected potential token theft for user ${user.email}. All refresh tokens revoked.`
        );
      }
    } catch (error) {
      // 토큰 검증 실패 시 조용히 처리
      console.error("Failed to revoke tokens:", error);
    }
  },
};

export default authMiddleware;
