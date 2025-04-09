import prisma from "../lib/prisma.js";
import { hash, compare } from "bcrypt-ts";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { AuthError } from "../constants/errors/authError.js";
import dbDayjs from "../lib/dayjs.js";
import { authService, UserInfo } from "./authService.js";

const HASH_ROUNDS = 10; // 10 rounds → 약 10ms, 12 rounds → 약 100ms

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export const ACCESS_TOKEN_EXPIRY = 15; // 15분
export const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60; // 7일

// 환경 변수 검증
const validateEnvVariables = () => {
  if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT secrets are not defined in environment variables.");
  }
};

validateEnvVariables();

const tokenService = {
  generateAccessToken(email: string): string {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) throw new AuthError("SECRET_KEY_NOT_FOUND");

    return jwt.sign({ email }, secret, {
      expiresIn: `${ACCESS_TOKEN_EXPIRY}m`,
    });
  },

  generateRefreshToken(email: string): string {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) throw new AuthError("SECRET_KEY_NOT_FOUND");

    return jwt.sign({ email }, secret, {
      expiresIn: `${REFRESH_TOKEN_EXPIRY}m`,
    });
  },

  async getUserFromToken(accessToken: string): Promise<UserInfo> {
    try {
      const decoded = jwt.verify(
        accessToken,
        process.env.JWT_ACCESS_SECRET!
      ) as JwtPayload & { email: string };
      if (!decoded?.email) throw new AuthError("INVALID_TOKEN");

      const user = await authService.getUserByEmail(decoded.email);
      if (!user) throw new AuthError("UNAUTHORIZED");

      return tokenService.mapUser(user);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError)
        throw new AuthError("TOKEN_EXPIRED");
      throw new AuthError("UNAUTHORIZED");
    }
  },

  async saveRefreshToken(
    userId: number,
    refreshToken: string,
    device?: string
  ): Promise<void> {
    const hashedToken = await hash(refreshToken, HASH_ROUNDS);
    await prisma.refreshToken.create({
      data: {
        hashedToken,
        userId,
        device,
        expiresAt: dbDayjs({ minutes: REFRESH_TOKEN_EXPIRY }),
        createdAt: dbDayjs(),
      },
    });
  },

  async validateRefreshToken(
    refreshToken: string,
    email: string
  ): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        refreshTokens: true,
      },
    });
    if (!user) throw new AuthError("UNAUTHORIZED");
    for (const token of user.refreshTokens) {
      const isValid = await compare(refreshToken, token.hashedToken);
      if (isValid) return true;
    }
    return false;
  },

  async deleteRefreshToken(userId: number): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  },

  // 리프레시 토큰으로 새로운 토큰 발급
  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    try {
      const refreshTokenSecret = process.env.JWT_REFRESH_SECRET;
      if (!refreshTokenSecret) throw new AuthError("SECRET_KEY_NOT_FOUND");

      // 리프레시 토큰 검증
      const decoded = jwt.verify(
        refreshToken,
        refreshTokenSecret
      ) as JwtPayload & { email: string };
      if (!decoded?.email) throw new AuthError("INVALID_TOKEN");

      // 사용자 및 토큰 조회
      const user = await prisma.user.findUnique({
        where: { email: decoded.email },
        include: { refreshTokens: true },
      });

      if (!user) throw new AuthError("INVALID_TOKEN");

      // 토큰 유효성 검증
      const isValidToken = await tokenService.validateRefreshToken(
        refreshToken,
        user.email
      );
      if (!isValidToken) throw new AuthError("INVALID_REFRESH_TOKEN");

      // 새 토큰 발급
      const newAccessToken = tokenService.generateAccessToken(user.email);
      const newRefreshToken = tokenService.generateRefreshToken(user.email);

      // 이전 토큰 삭제 및 새 토큰 저장
      await prisma.$transaction([
        prisma.refreshToken.deleteMany({
          where: { userId: user.id },
        }),
        prisma.refreshToken.create({
          data: {
            hashedToken: await hash(newRefreshToken, HASH_ROUNDS),
            userId: user.id,
            expiresAt: dbDayjs({ minutes: REFRESH_TOKEN_EXPIRY }),
            createdAt: dbDayjs(),
          },
        }),
      ]);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      console.error("Refresh token error:", error);
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthError("TOKEN_EXPIRED");
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthError("INVALID_REFRESH_TOKEN");
      }
      throw new AuthError("REFRESH_TOKEN_FAILED");
    }
  },

  mapUser(user: UserInfo): UserInfo {
    return {
      userId: user.userId,
      email: user.email,
      nickname: user.nickname,
      positionId: user.positionId,
    };
  },
};

export default tokenService;
