import { Request, Response, NextFunction } from "express";
import { UserInfo } from "../services/authService.js";
import { AuthError } from "../constants/errors/authError.js";
import tokenService, { TokenPair } from "../services/tokenService.js";

export const ACCESS_TOKEN_EXPIRY = 60; // 15분 (분 단위)
export const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60; // 7일 (분 단위)

export interface AuthRequest extends Request {
  user: UserInfo;
  cookies: {
    accessToken?: string;
    refreshToken?: string;
  };
}

const authMiddleware = {
  authenticate,
  extractTokenFromCookie,
  setTokenCookies,
  clearTokenCookies,
};

async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const request = req as AuthRequest;
    const accessToken = await authMiddleware.extractTokenFromCookie(
      request,
      res
    );
    request.user = await tokenService.getUserFromToken(accessToken);
    next();
  } catch (error) {
    next(error);
  }
}

async function extractTokenFromCookie(
  req: Request,
  res: Response
): Promise<string> {
  const { accessToken, refreshToken } = req.cookies as TokenPair;
  if (accessToken) return accessToken;
  if (!refreshToken) throw new AuthError("UNAUTHORIZED");

  const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
    await tokenService.refreshTokens(refreshToken);

  setTokenCookies(res, {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });

  return newAccessToken;
}

function setTokenCookies(
  res: Response,
  { accessToken, refreshToken }: TokenPair
): void {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    maxAge: ACCESS_TOKEN_EXPIRY * 60 * 1000,
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "none",
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    maxAge: REFRESH_TOKEN_EXPIRY * 60 * 1000,
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "none",
  });
}

function clearTokenCookies(res: Response): void {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: true,
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "none",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "none",
  });
}

export default authMiddleware;
