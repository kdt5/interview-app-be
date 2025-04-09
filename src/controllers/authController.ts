import { Request, NextFunction, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { authService } from "../services/authService.js";
import authMiddleware, { AuthRequest } from "../middlewares/authMiddleware.js";
import { AuthError } from "../constants/errors/authError.js";
import tokenService from "../services/tokenService.js";

interface CheckEmailAvailabilityRequest extends Request {
  body: {
    email: string;
  };
}

export async function checkEmailAvailability(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const request = req as CheckEmailAvailabilityRequest;
    const { email } = request.body;
    const isAvailable = await authService.checkAvailability(email, "email");

    res.status(isAvailable ? StatusCodes.OK : StatusCodes.CONFLICT).send();
  } catch (error) {
    next(error);
  }
}

interface CheckNicknameAvailabilityRequest extends Request {
  body: {
    nickname: string;
  };
}

export async function checkNicknameAvailability(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const request = req as CheckNicknameAvailabilityRequest;
    const { nickname } = request.body;
    const isAvailable = await authService.checkAvailability(
      nickname,
      "nickname"
    );

    res.status(isAvailable ? StatusCodes.OK : StatusCodes.CONFLICT).send();
  } catch (error) {
    next(error);
  }
}

interface SignupRequest extends Request {
  body: {
    password: string;
    email: string;
    nickname: string;
    positionId: number;
  };
}

export async function signup(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const request = req as SignupRequest;
    const { password, email, nickname, positionId } = request.body;

    const isEmailAvailable = await authService.checkAvailability(
      email,
      "email"
    );
    if (!isEmailAvailable) {
      res.status(StatusCodes.CONFLICT).json({
        message: "이미 사용 중인 이메일입니다.",
      });
      return;
    }

    const isNicknameAvailable = await authService.checkAvailability(
      nickname,
      "nickname"
    );
    if (!isNicknameAvailable) {
      res.status(StatusCodes.CONFLICT).json({
        message: "이미 사용 중인 닉네임입니다.",
      });
      return;
    }

    const isPositionAvailable = await authService.checkPositionAvailability(
      positionId
    );
    if (!isPositionAvailable) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "존재하지 않는 포지션입니다.",
      });
      return;
    }

    const user = await authService.createUser(
      password,
      email,
      nickname,
      positionId
    );

    res.status(StatusCodes.CREATED).json({
      email: user.email,
      nickname: user.nickname,
      positionId: user.positionId,
    });
  } catch (error) {
    next(error);
  }
}

interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const request = req as LoginRequest;
    const { email, password } = request.body;
    const { user, accessToken, refreshToken } =
      await authService.authenticateUser(email, password);

    authMiddleware.setTokenCookies(res, { accessToken, refreshToken });

    res.status(StatusCodes.OK).json({
      email: user.email,
      nickname: user.nickname,
      positionId: user.positionId,
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const request = req as AuthRequest;
    await tokenService.deleteRefreshToken(request.user.userId);
    authMiddleware.clearTokenCookies(res);

    res.status(StatusCodes.OK).send();
  } catch (error) {
    next(error);
  }
}

interface RefreshRequest extends Request {
  cookies: {
    refreshToken?: string;
  };
}

export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const request = req as RefreshRequest;
    const oldRefreshToken = request.cookies.refreshToken;

    if (!oldRefreshToken) {
      throw new AuthError("REFRESH_TOKEN_REQUIRED");
    }

    const { accessToken, refreshToken } = await tokenService.refreshTokens(
      oldRefreshToken
    );

    authMiddleware.setTokenCookies(res, { accessToken, refreshToken });

    res.status(StatusCodes.OK).send();
  } catch (error) {
    if (error instanceof AuthError) {
      authMiddleware.clearTokenCookies(res);
      res.status(StatusCodes.UNAUTHORIZED).send();
      return;
    }
    next(error);
  }
}

interface ResetPasswordRequest extends Request {
  body: {
    token: string;
    newPassword: string;
  };
}

export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const request = req as ResetPasswordRequest;
    const { token, newPassword } = request.body;
    await authService.resetPassword(token, newPassword);

    res.status(StatusCodes.OK).send();
  } catch (error) {
    next(error);
  }
}
