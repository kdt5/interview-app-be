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
  async authenticate(req: Request, res: Response, next: NextFunction) {
    try {
      const request = req as AuthRequest;
      const accessToken = await this.extractTokenFromCookie(request);
      request.user = await tokenService.getUserFromToken(accessToken);
      next();
    } catch (error) {
      next(error);
    }
  },

  async extractTokenFromCookie(req: Request): Promise<string> {
    const { accessToken, refreshToken } = req.cookies as TokenPair;
    if (accessToken) return accessToken;
    if (!refreshToken) throw new AuthError("UNAUTHORIZED");

    const { accessToken: newAccessToken } = await tokenService.refreshTokens(
      refreshToken
    );
    return newAccessToken;
  },

  setTokenCookies(
    res: Response,
    { accessToken, refreshToken }: TokenPair
  ): void {
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: ACCESS_TOKEN_EXPIRY * 60 * 1000,
      sameSite: "strict",
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: REFRESH_TOKEN_EXPIRY * 60 * 1000,
      sameSite: "strict",
    });
  },

  clearTokenCookies(res: Response): void {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
  },
};

export default authMiddleware;
