import { hash, compare } from "bcrypt-ts";
import jwt, { JwtPayload } from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { User, Prisma } from "@prisma/client";
import { DuplicateError, AuthError } from "../constants/errors/authError.js";
import dbDayjs from "../lib/dayjs.js";

const HASH_ROUNDS = 10; // 10 rounds → 약 10ms, 12 rounds → 약 100ms

export interface UserInfo {
  email: string;
  nickName: string;
}

export interface AuthResponse {
  user: UserInfo;
  accessToken: string;
  refreshToken: string;
}

type CheckType = "email" | "nickName";

export const checkAvailability = async (
  item: string,
  type: CheckType
): Promise<boolean> => {
  const where = {
    [type]: item,
  } as unknown as Prisma.UserWhereUniqueInput;

  const existingItem = await prisma.user.findUnique({ where });
  return !existingItem;
};

export const createUser = async (
  password: string,
  email: string,
  nickName: string
): Promise<User> => {
  const existingEmail = await prisma.user.findUnique({
    where: { email: email },
  });
  if (existingEmail) {
    throw new DuplicateError("EMAIL_DUPLICATE");
  }

  const existingNickname = await prisma.user.findUnique({
    where: { nickName: nickName },
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
      nickName: nickName,
      createdAt: dbDayjs(),
      updatedAt: dbDayjs(),
    },
  });
};

export const authenticateUser = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
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
    expiresIn: "1h",
  });

  // 리프레시 토큰 생성 (긴 유효기간)
  const refreshToken = jwt.sign({ email: user.email }, refreshTokenSecret, {
    expiresIn: "7d",
  });

  // 기존 리프레시 토큰 삭제 (선택적)
  await prisma.refreshToken.deleteMany({
    where: { userId: user.id },
  });

  // 새 리프레시 토큰 저장
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      expiresAt: dbDayjs({ minutes: 7 * 24 * 60 }), // 7일
      userId: user.id,
      device: null, // 필요시 기기 정보 추가
      createdAt: dbDayjs(),
    },
  });

  return {
    user: {
      email: user.email,
      nickName: user.nickName,
    },
    accessToken,
    refreshToken,
  };
};

export const deleteRefreshToken = async (
  refreshToken: string
): Promise<void> => {
  await prisma.refreshToken.deleteMany({
    where: { token: refreshToken },
  });
};

export const changeUserNickname = async (
  email: string | undefined,
  nickName: string
): Promise<void> => {
  if (!email) {
    throw new AuthError("UNAUTHORIZED");
  }

  const existingNickname = await prisma.user.findUnique({
    where: { nickName: nickName },
  });

  if (existingNickname) {
    throw new DuplicateError("NICKNAME_DUPLICATE");
  }

  await prisma.user.update({
    where: { email: email },
    data: { nickName: nickName, updatedAt: dbDayjs() },
  });
};

export const changeUserPassword = async (
  email: string | undefined,
  oldPassword: string,
  newPassword: string
): Promise<void> => {
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
};

export const getUserByEmail = async (email: string): Promise<UserInfo> => {
  const user = await prisma.user.findUnique({
    where: { email: email },
  });

  if (!user) {
    throw new AuthError("UNAUTHORIZED");
  }

  return { email: user.email, nickName: user.nickName };
};

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export const refreshTokens = async (
  refreshToken: string
): Promise<TokenPair> => {
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
    if (new Date() > tokenData.expiresAt) {
      // 만료된 토큰 삭제
      await prisma.refreshToken.delete({
        where: { id: tokenData.id },
      });
      throw new AuthError("TOKEN_EXPIRED");
    }

    // 새로운 토큰 쌍 생성
    const newAccessToken = jwt.sign({ email: tokenData.user.email }, secret, {
      expiresIn: "1h",
    });

    const newRefreshToken = jwt.sign(
      { email: tokenData.user.email },
      refreshTokenSecret,
      { expiresIn: "7d" }
    );

    // 이전 Refresh Token 삭제 및 새로운 토큰 저장
    await prisma.refreshToken.delete({
      where: { id: tokenData.id },
    });

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        expiresAt: dbDayjs({ minutes: 7 * 24 * 60 }), // 7일
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
};
