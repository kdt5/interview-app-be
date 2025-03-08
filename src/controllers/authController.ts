import { Request, NextFunction, Response } from "express";
import { StatusCodes } from "http-status-codes";
import {
  createUser,
  authenticateUser,
  checkAvailability,
  deleteRefreshToken,
} from "../services/authService.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { AuthError } from "../constants/errors/authError.js";

interface CheckEmailAvailabilityRequest extends Request {
  body: {
    email: string;
  };
}

interface CheckNicknameAvailabilityRequest extends Request {
  body: {
    nickName: string;
  };
}

interface SignupRequest extends Request {
  body: {
    password: string;
    email: string;
    nickName: string;
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

export const checkEmailAvailability = async (
  req: CheckEmailAvailabilityRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;
    const isAvailable = await checkAvailability(email, "email");

    res.status(isAvailable ? StatusCodes.OK : StatusCodes.CONFLICT).send();
  } catch (error) {
    next(error);
  }
};

export const checkNicknameAvailability = async (
  req: CheckNicknameAvailabilityRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { nickName } = req.body;
    const isAvailable = await checkAvailability(nickName, "nickName");

    res.status(isAvailable ? StatusCodes.OK : StatusCodes.CONFLICT).send();
  } catch (error) {
    next(error);
  }
};

export const signup = async (
  req: SignupRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { password, email, nickName } = req.body;

    const isEmailAvailable = await checkAvailability(email, "email");
    if (!isEmailAvailable) {
      res.status(StatusCodes.CONFLICT).json({
        message: "이미 사용 중인 이메일입니다.",
      });
      return;
    }

    const isNicknameAvailable = await checkAvailability(nickName, "nickName");
    if (!isNicknameAvailable) {
      res.status(StatusCodes.CONFLICT).json({
        message: "이미 사용 중인 닉네임입니다.",
      });
      return;
    }

    const user = await createUser(password, email, nickName);

    res.status(StatusCodes.CREATED).json({
      email: user.email,
      nickName: user.nickName,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: LoginRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authenticateUser(
      email,
      password
    );

    authMiddleware.setAccessTokenCookie(res, accessToken);
    authMiddleware.setRefreshTokenCookie(res, refreshToken);

    res.status(StatusCodes.OK).json({
      email: user.email,
      nickName: user.nickName,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await deleteRefreshToken(refreshToken);
    }
    authMiddleware.clearAccessTokenCookie(res);
    authMiddleware.clearRefreshTokenCookie(res);

    res.status(StatusCodes.OK).send();
  } catch (error) {
    next(error);
  }
};

export const refresh = async (
  req: RefreshRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
};
