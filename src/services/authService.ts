import { hash, compare } from "bcrypt-ts";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { User, Prisma } from "@prisma/client";
import { DuplicateError, AuthError } from "../constants/errors/authError.js";
import dbDayjs from "../lib/dayjs.js";
import { emailService } from "./emailService.js";
import crypto from "crypto";
import tokenService from "./tokenService.js";

const HASH_ROUNDS = 10; // 10 rounds → 약 10ms, 12 rounds → 약 100ms

export interface UserInfo {
  userId: number;
  email: string;
  nickname: string;
  positionId: number;
  level: number;
  point: number;
  profileImageUrl?: string;
}

export interface AuthResponse {
  user: UserInfo;
  accessToken: string;
  refreshToken: string;
}

type CheckType = "email" | "nickname";

const authService = {
  checkAvailability,
  checkPositionAvailability,
  createUser,
  authenticateUser,
  changeUserNickname,
  changeUserPassword,
  recoverUserPassword,
  resetPassword,
  getUserByEmail,
};

async function checkAvailability(
  item: string,
  type: CheckType
): Promise<boolean> {
  const where = {
    [type]: item,
  } as unknown as Prisma.UserWhereUniqueInput;

  const existingItem = await prisma.user.findUnique({ where });
  return !existingItem;
}

async function checkPositionAvailability(
  positionId: number | undefined
): Promise<boolean> {
  if (!positionId) return true;
  const existingPosition = await prisma.position.findUnique({
    where: { id: positionId },
  });
  return !!existingPosition;
}

async function createUser(
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

async function authenticateUser(
  email: string,
  password: string
): Promise<AuthResponse> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      nickname: true,
      positionId: true,
      level: true,
      point: true,
      profileImageUrl: true,
      password: true,
    },
    include: { refreshTokens: true },
  });

  if (!user) throw new AuthError("UNAUTHORIZED");

  const isValidPassword = await compare(password, user.password);
  if (!isValidPassword) throw new AuthError("INVALID_PASSWORD");

  // 토큰 생성
  const accessToken = tokenService.generateAccessToken(email);
  const refreshToken = tokenService.generateRefreshToken(email);

  // 이전 리프레시 토큰 정리
  await prisma.refreshToken.deleteMany({
    where: {
      userId: user.id,
    },
  });

  // 새 리프레시 토큰 저장
  await tokenService.saveRefreshToken(user.id, refreshToken);

  return {
    user: {
      userId: user.id,
      email: user.email,
      nickname: user.nickname,
      positionId: user.positionId ?? 0,
      level: user.level,
      point: user.point,
      profileImageUrl: user.profileImageUrl ?? undefined,
    },
    accessToken,
    refreshToken,
  };
}

async function changeUserNickname(
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

async function recoverUserPassword(email: string): Promise<void> {
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

async function resetPassword(
  token: string,
  newPassword: string
): Promise<void> {
  try {
    const jwtSecret = process.env.JWT_ACCESS_SECRET;
    if (!jwtSecret) {
      throw new AuthError("SECRET_KEY_NOT_FOUND");
    }

    // 토큰 검증
    const decoded = jwt.verify(token, jwtSecret) as { userId: number };

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

async function changeUserPassword(
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

async function getUserByEmail(email: string): Promise<UserInfo> {
  const user = await prisma.user.findUnique({
    where: { email: email },
    select: {
      id: true,
      email: true,
      nickname: true,
      positionId: true,
      level: true,
      point: true,
      profileImageUrl: true,
    },
  });

  if (!user) {
    throw new AuthError("UNAUTHORIZED");
  }

  return {
    userId: user.id,
    email: user.email,
    nickname: user.nickname,
    positionId: user.positionId ?? 0,
    level: user.level,
    point: user.point,
    profileImageUrl: user.profileImageUrl ?? undefined,
  };
}

export default authService;
