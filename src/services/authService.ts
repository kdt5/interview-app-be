import { hash, compare } from "bcrypt-ts";
import jwt, { JwtPayload } from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { User, Prisma } from "@prisma/client";
import { DuplicateError, AuthError } from "../constants/errors/authError.js";
import {
  REFRESH_TOKEN_EXPIRY,
  ACCESS_TOKEN_EXPIRY,
} from "../middlewares/authMiddleware.js";
import dbDayjs from "../lib/dayjs.js";
import { emailService } from "./emailService.js";
import crypto from "crypto";

const HASH_ROUNDS = 10; // 10 rounds → 약 10ms, 12 rounds → 약 100ms

export interface UserInfo {
  userId: number;
  email: string;
  nickname: string;
  positionId: number | null;
}

export interface AuthResponse {
  user: UserInfo;
  accessToken: string;
  refreshToken: string;
}

type CheckType = "email" | "nickname";

export async function checkAvailability(
  item: string,
  type: CheckType
): Promise<boolean> {
  const where = {
    [type]: item,
  } as unknown as Prisma.UserWhereUniqueInput;

  const existingItem = await prisma.user.findUnique({ where });
  return !existingItem;
}

export async function checkPositionAvailability(
  positionId: number | undefined
): Promise<boolean> {
  if (!positionId) return true;
  const existingPosition = await prisma.position.findUnique({
    where: { id: positionId },
  });
  return !!existingPosition;
}

export async function createUser(
  password: string,
  email: string,
  nickname: string,
  positionId?: number
): Promise<User> {
  const existingEmail = await prisma.user.findUnique({
    where: { email: email },
  });
  if (existingEmail) {
    throw new DuplicateError("EMAIL_DUPLICATE");
  }

  const existingNickname = await prisma.user.findUnique({
    where: { nickname: nickname },
  });
  if (existingNickname) {
    throw new DuplicateError("NICKNAME_DUPLICATE");
  }

  // 비밀번호 해시화
  const hashedPassword = await hash(password, HASH_ROUNDS);

  // 사용자 생성
  return prisma.user.create({
    data: {
      password: hashedPassword,
      email: email,
      nickname: nickname,
      ...(positionId && { Position: { connect: { id: positionId } } }),
      createdAt: dbDayjs(),
      updatedAt: dbDayjs(),
    },
  });
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<AuthResponse> {
  const user = await prisma.user.findUnique({
    where: { email: email },
  });

  if (!user) {
    throw new AuthError("NOT_FOUND_USER");
  }

  const isValidPassword = await compare(password, user.password);
  if (!isValidPassword) {
    throw new AuthError("INVALID_PASSWORD");
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AuthError("SECRET_KEY_NOT_FOUND");
  }

  const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
  if (!refreshTokenSecret) {
    throw new AuthError("SECRET_KEY_NOT_FOUND");
  }

  // 액세스 토큰 생성 (짧은 유효기간)
  const accessToken = jwt.sign({ email: user.email }, secret, {
    expiresIn: `${ACCESS_TOKEN_EXPIRY}m`,
  });

  // 리프레시 토큰 생성 (긴 유효기간)
  const refreshToken = jwt.sign({ email: user.email }, refreshTokenSecret, {
    expiresIn: `${REFRESH_TOKEN_EXPIRY}m`,
  });

  // 기존 리프레시 토큰 삭제 (선택적)
  await prisma.refreshToken.deleteMany({
    where: { userId: user.id },
  });

  // 새 리프레시 토큰 저장
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      expiresAt: dbDayjs({ minutes: REFRESH_TOKEN_EXPIRY }),
      userId: user.id,
      device: null, // 필요시 기기 정보 추가
      createdAt: dbDayjs(),
    },
  });

  return {
    user: {
      userId: user.id,
      email: user.email,
      nickname: user.nickname,
      positionId: user.positionId ?? null,
    },
    accessToken,
    refreshToken,
  };
}

export async function deleteRefreshToken(refreshToken: string): Promise<void> {
  await prisma.refreshToken.deleteMany({
    where: { token: refreshToken },
  });
}

export async function changeUserNickname(
  email: string | undefined,
  nickname: string
): Promise<void> {
  if (!email) {
    throw new AuthError("UNAUTHORIZED");
  }

  const existingNickname = await prisma.user.findUnique({
    where: { nickname: nickname },
  });

  if (existingNickname) {
    throw new DuplicateError("NICKNAME_DUPLICATE");
  }

  await prisma.user.update({
    where: { email: email },
    data: { nickname: nickname, updatedAt: dbDayjs() },
  });
}

export async function recoverUserPassword(email: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { email: email },
  });

  if (!user) {
    throw new AuthError("NOT_FOUND_USER");
  }

  // 비밀번호 재설정 토큰 생성
  // Generate a random token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash the token for secure storage
  const hashedResetToken = await hash(resetToken, HASH_ROUNDS);

  // Save the hashed token to the database with an expiry timestamp
  await prisma.passwordResetToken.create({
    data: {
      hashedToken: hashedResetToken,
      userId: user.id,
      expiresAt: dbDayjs({ minutes: 60 }), // Token expires in 1 hour
    },
  });

  // 비밀번호 재설정 링크 생성
  const resetLink = `${process.env.PASSWORD_RESET_FRONTEND_URL}/reset-password?token=${resetToken}`;

  // 이메일 전송
  await emailService.sendPasswordResetEmail(user.email, resetLink);
}

export async function resetPassword(
  token: string,
  newPassword: string
): Promise<void> {
  try {
    // 토큰 검증
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default_secret"
    ) as { userId: number };

    // 비밀번호 해시화
    const hashedPassword = await hash(newPassword, HASH_ROUNDS);

    // 사용자 비밀번호 업데이트
    await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        password: hashedPassword,
        updatedAt: dbDayjs(),
      },
    });

    // 사용된 토큰 삭제
    await prisma.passwordResetToken.deleteMany({
      where: { userId: decoded.userId },
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthError("RESET_TOKEN_EXPIRED");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthError("INVALID_RESET_TOKEN");
    }
    throw new AuthError("PASSWORD_RESET_FAILED");
  }
}

export async function changeUserPassword(
  email: string | undefined,
  oldPassword: string,
  newPassword: string
): Promise<void> {
  if (!email) {
    throw new AuthError("UNAUTHORIZED");
  }

  const user = await prisma.user.findUnique({
    where: { email: email },
  });

  if (!user) {
    throw new AuthError("UNAUTHORIZED");
  }

  const isValidPassword = await compare(oldPassword, user.password);
  if (!isValidPassword) {
    throw new AuthError("PASSWORD_MISMATCH");
  }

  const hashedPassword = await hash(newPassword, HASH_ROUNDS);
  await prisma.user.update({
    where: { email: email },
    data: { password: hashedPassword, updatedAt: dbDayjs() },
  });
}

export async function getUserByEmail(email: string): Promise<UserInfo> {
  const user = await prisma.user.findUnique({
    where: { email: email },
  });

  if (!user) {
    throw new AuthError("UNAUTHORIZED");
  }

  return {
    userId: user.id,
    email: user.email,
    nickname: user.nickname,
    positionId: user.positionId ?? null,
  };
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export async function refreshTokens(refreshToken: string): Promise<TokenPair> {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new AuthError("SECRET_KEY_NOT_FOUND");
    }

    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
    if (!refreshTokenSecret) {
      throw new AuthError("SECRET_KEY_NOT_FOUND");
    }

    // Refresh Token 검증
    jwt.verify(refreshToken, refreshTokenSecret) as JwtPayload;

    // DB에서 Refresh Token 조회
    const tokenData = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!tokenData) {
      throw new AuthError("INVALID_REFRESH_TOKEN");
    }

    // 토큰 만료 확인
    if (dbDayjs() > tokenData.expiresAt) {
      // 만료된 토큰 삭제
      await prisma.refreshToken.delete({
        where: { id: tokenData.id },
      });
      throw new AuthError("TOKEN_EXPIRED");
    }

    // 새로운 토큰 쌍 생성
    const newAccessToken = jwt.sign({ email: tokenData.user.email }, secret, {
      expiresIn: `${ACCESS_TOKEN_EXPIRY}m`,
    });

    const newRefreshToken = jwt.sign(
      { email: tokenData.user.email },
      refreshTokenSecret,
      { expiresIn: `${REFRESH_TOKEN_EXPIRY}m` }
    );

    // 이전 Refresh Token 삭제 및 새로운 토큰 저장
    await prisma.refreshToken.delete({
      where: { id: tokenData.id },
    });

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        expiresAt: dbDayjs({ minutes: REFRESH_TOKEN_EXPIRY }),
        userId: tokenData.userId,
        device: tokenData.device,
        createdAt: dbDayjs(),
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthError("TOKEN_EXPIRED");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthError("INVALID_REFRESH_TOKEN");
    }
    throw new AuthError("REFRESH_TOKEN_FAILED");
  }
}

export const authService = {
  checkAvailability,
  checkPositionAvailability,
  createUser,
  authenticateUser,
  deleteRefreshToken,
  changeUserNickname,
  changeUserPassword,
  recoverUserPassword,
  resetPassword,
  getUserByEmail,
  refreshTokens,
};
