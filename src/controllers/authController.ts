import { Request, NextFunction, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { authService } from "../services/authService.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { AuthError } from "../constants/errors/authError.js";

interface CheckEmailAvailabilityRequest extends Request {
  body: {
    email: string;
  };
}

interface CheckNicknameAvailabilityRequest extends Request {
  body: {
    nickname: string;
  };
}

interface SignupRequest extends Request {
  body: {
    password: string;
    email: string;
    nickname: string;
    positionId: number;
  };
}

interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

interface RefreshRequest extends Request {
  cookies: {
    refreshToken: string;
  };
}

export async function checkEmailAvailability(
  req: CheckEmailAvailabilityRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email } = req.body;
    const isAvailable = await authService.checkAvailability(email, "email");

    res.status(isAvailable ? StatusCodes.OK : StatusCodes.CONFLICT).send();
  } catch (error) {
    next(error);
  }
}

export async function checkNicknameAvailability(
  req: CheckNicknameAvailabilityRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { nickname } = req.body;
    const isAvailable = await authService.checkAvailability(
      nickname,
      "nickname"
    );

    res.status(isAvailable ? StatusCodes.OK : StatusCodes.CONFLICT).send();
  } catch (error) {
    next(error);
  }
}

export async function signup(
  req: SignupRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { password, email, nickname, positionId } = req.body;

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

export async function login(
  req: LoginRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } =
      await authService.authenticateUser(email, password);

    authMiddleware.setAccessTokenCookie(res, accessToken);
    authMiddleware.setRefreshTokenCookie(res, refreshToken);

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
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await authService.deleteRefreshToken(refreshToken);
    }
    authMiddleware.clearAccessTokenCookie(res);
    authMiddleware.clearRefreshTokenCookie(res);

    res.status(StatusCodes.OK).send();
  } catch (error) {
    next(error);
  }
}

export async function refresh(
  req: RefreshRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await authMiddleware.rotateTokens(req.cookies.refreshToken, res);

    res.status(StatusCodes.OK).send();
  } catch (error) {
    if (error instanceof AuthError) {
      authMiddleware.clearAccessTokenCookie(res);
      authMiddleware.clearRefreshTokenCookie(res);

      res.status(StatusCodes.UNAUTHORIZED).send();
      return;
    }
    next(error);
  }
}

// 비밀번호 재설정
interface ResetPasswordRequest extends Request {
  body: {
    token: string;
    newPassword: string;
  };
}

export async function resetPassword(
  req: ResetPasswordRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { token, newPassword } = req.body;
    await authService.resetPassword(token, newPassword);

    res.status(StatusCodes.OK).send();
  } catch (error) {
    next(error);
  }
}
