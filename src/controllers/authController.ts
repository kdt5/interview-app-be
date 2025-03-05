import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import {
  createUser,
  authenticateUser,
  checkAvailability,
  deleteRefreshToken,
} from "../services/authService.js";
import { RequestWithUser } from "../middlewares/authMiddleware.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { AuthError } from "../constants/errors/authError.js";

interface CheckEmailAvailabilityRequest {
  email: string;
}

interface CheckNicknameAvailabilityRequest {
  nickName: string;
}

interface SignupRequest {
  password: string;
  email: string;
  nickName: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

export type EmptyObject = Record<string, never>;

export interface UserResponse {
  email: string;
  nickName: string;
}

interface MessageResponse {
  message: string;
}

export const checkEmailAvailability: RequestHandler<
  EmptyObject,
  void,
  CheckEmailAvailabilityRequest
> = async (req, res, next): Promise<void> => {
  try {
    const { email } = req.body;
    const isAvailable = await checkAvailability(email, "email");

    res.status(isAvailable ? StatusCodes.OK : StatusCodes.CONFLICT).send();
  } catch (error) {
    next(error);
  }
};

export const checkNicknameAvailability: RequestHandler<
  EmptyObject,
  void,
  CheckNicknameAvailabilityRequest
> = async (req, res, next): Promise<void> => {
  try {
    const { nickName } = req.body;
    const isAvailable = await checkAvailability(nickName, "nickName");

    res.status(isAvailable ? StatusCodes.OK : StatusCodes.CONFLICT).send();
  } catch (error) {
    next(error);
  }
};

export const signup: RequestHandler<
  EmptyObject,
  UserResponse | MessageResponse,
  SignupRequest
> = async (req, res, next): Promise<void> => {
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

export const login: RequestHandler<
  EmptyObject,
  UserResponse,
  LoginRequest
> = async (req, res, next): Promise<void> => {
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

export const logout: RequestHandler = async (
  req: RequestWithUser,
  res,
  next
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

export const refresh: RequestHandler = async (
  req,
  res,
  next
): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new AuthError("REFRESH_TOKEN_REQUIRED");
    }

    // 토큰 순환 메서드 사용
    await authMiddleware.rotateTokens(refreshToken, res);

    res.status(StatusCodes.OK).send();
  } catch (error) {
    // 토큰 재사용 시도 등의 보안 이슈는 컨트롤러 레벨에서 특별 처리
    // 이는 쿠키 삭제와 같은 응답 객체 조작이 필요하기 때문
    if (error instanceof AuthError) {
      authMiddleware.clearAccessTokenCookie(res);
      authMiddleware.clearRefreshTokenCookie(res);

      if (error.errorType === "INVALID_REFRESH_TOKEN") {
        // 토큰 도난 의심 - 보안 경고
        const securityError = new AuthError("SECURITY_RELOGIN_REQUIRED");
        next(securityError);
      } else if (error.errorType === "TOKEN_EXPIRED") {
        // 단순 만료 - 일반적인 재로그인 요청
        res.status(StatusCodes.NO_CONTENT).send();
      } else {
        next(error);
      }
      return;
    }

    next(error);
  }
};
