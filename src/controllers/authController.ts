import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import {
  createUser,
  authenticateUser,
  checkAvailability,
  deleteRefreshToken,
} from "../services/authService.js";
import {
  changeUserNickname,
  changeUserPassword,
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

interface ChangeNicknameRequest {
  nickName: string;
}

interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

type EmptyObject = Record<string, never>;

interface MessageResponse {
  message: string;
}

interface MessageResponseWithUser extends MessageResponse {
  user: {
    email: string;
    nickName: string;
  };
}

export const checkEmailAvailability: RequestHandler<
  EmptyObject,
  MessageResponse,
  CheckEmailAvailabilityRequest
> = async (req, res, next): Promise<void> => {
  try {
    const { email } = req.body;
    const isAvailable = await checkAvailability(email, "email");

    res.status(StatusCodes.OK).json({
      message: isAvailable
        ? "사용 가능한 이메일입니다."
        : "이미 사용 중인 이메일입니다.",
    });
  } catch (error) {
    next(error);
  }
};

export const checkNicknameAvailability: RequestHandler<
  EmptyObject,
  MessageResponse,
  CheckNicknameAvailabilityRequest
> = async (req, res, next): Promise<void> => {
  try {
    const { nickName } = req.body;
    const isAvailable = await checkAvailability(nickName, "nickName");

    res.status(StatusCodes.OK).json({
      message: isAvailable
        ? "사용 가능한 닉네임입니다."
        : "이미 사용 중인 닉네임입니다.",
    });
  } catch (error) {
    next(error);
  }
};

export const signup: RequestHandler<
  EmptyObject,
  MessageResponseWithUser,
  SignupRequest
> = async (req, res, next): Promise<void> => {
  try {
    const { password, email, nickName } = req.body;
    const user = await createUser(password, email, nickName);

    res.status(StatusCodes.CREATED).json({
      message: "회원가입이 완료되었습니다.",
      user: {
        email: user.email,
        nickName: user.nickName,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login: RequestHandler<
  EmptyObject,
  MessageResponseWithUser,
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
      message: "로그인이 완료되었습니다.",
      user: {
        email: user.email,
        nickName: user.nickName,
      },
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

    res.status(StatusCodes.OK).json({ message: "로그아웃이 완료되었습니다." });
  } catch (error) {
    next(error);
  }
};

export const changeNickname: RequestHandler<
  EmptyObject,
  MessageResponseWithUser,
  ChangeNicknameRequest
> = async (req: RequestWithUser, res, next): Promise<void> => {
  try {
    const { nickName } = req.body;
    const user = await changeUserNickname(req.user?.email, nickName);

    res.status(StatusCodes.OK).json({
      message: "닉네임이 변경되었습니다.",
      user: {
        email: user.email,
        nickName: user.nickName,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword: RequestHandler<
  EmptyObject,
  MessageResponse,
  ChangePasswordRequest
> = async (req: RequestWithUser, res, next): Promise<void> => {
  try {
    const { oldPassword, newPassword } = req.body;
    await changeUserPassword(req.user?.email, oldPassword, newPassword);

    res.status(StatusCodes.OK).json({
      message: "비밀번호가 변경되었습니다.",
    });
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

    res.status(StatusCodes.OK).json({
      message: "토큰이 갱신되었습니다.",
    });
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
        res.status(StatusCodes.UNAUTHORIZED).json({
          message: "세션이 만료되었습니다. 다시 로그인해주세요.",
        });
      } else {
        next(error);
      }
      return;
    }

    next(error);
  }
};
