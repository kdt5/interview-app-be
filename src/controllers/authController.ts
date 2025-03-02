import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { createUser, authenticateUser, checkAvailability, AvailabilityCheckType, deleteRefreshToken } from "../services/authService.js";
import { changeUserNickname, changeUserPassword } from "../services/authService.js";
import { RequestWithUser } from "../middlewares/authMiddleware.js";
import authMiddleware from '../middlewares/authMiddleware.js';
import { AuthError } from "../utils/errors/authError.js";

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

export const checkEmailAvailability: RequestHandler<EmptyObject, MessageResponse, CheckEmailAvailabilityRequest> = async (req, res, next): Promise<void> => {
    try {
        const { email } = req.body;
        const result = await checkAvailability(email, AvailabilityCheckType.EMAIL);
        res.status(StatusCodes.OK).json({ message: result.message });
    } catch (error) {
        next(error);
    }
};

export const checkNicknameAvailability: RequestHandler<EmptyObject, MessageResponse, CheckNicknameAvailabilityRequest> = async (req, res, next): Promise<void> => {
    try {
        const { nickName } = req.body;
        const result = await checkAvailability(nickName, AvailabilityCheckType.NICKNAME);
        res.status(StatusCodes.OK).json({ message: result.message });
    } catch (error) {
        next(error);
    }
};

export const signup: RequestHandler<EmptyObject, MessageResponseWithUser, SignupRequest> = async (req, res, next): Promise<void> => {
    try {
        const { password, email, nickName } = req.body;

        const user = await createUser(password, email, nickName);

        res.status(StatusCodes.CREATED).json({
            message: "회원가입이 완료되었습니다.",
            user: {
                email: user.email,
                nickName: user.nickName
            }
        });
    } catch (error) {
        next(error);
    }
};

export const login: RequestHandler<EmptyObject, MessageResponseWithUser, LoginRequest> = async (req, res, next): Promise<void> => {
    try {
        const { email, password } = req.body;
        const { user, accessToken, refreshToken } = await authenticateUser(email, password);

        // 액세스 토큰과 리프레시 토큰을 모두 쿠키에 설정
        authMiddleware.setAccessTokenCookie(res, accessToken);
        authMiddleware.setRefreshTokenCookie(res, refreshToken);

        res.status(StatusCodes.OK).json({
            message: "로그인이 완료되었습니다.",
            user: {
                email: user.email,
                nickName: user.nickName
            }
        });
    } catch (error) {
        next(error);
    }
};

export const logout: RequestHandler = async (req: RequestWithUser, res, next): Promise<void> => {
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

export const changeNickname: RequestHandler<EmptyObject, MessageResponseWithUser, ChangeNicknameRequest> = async (req: RequestWithUser, res, next): Promise<void> => {
    try {
        const { nickName } = req.body;
        const user = await changeUserNickname(req.user?.email, nickName);

        res.status(StatusCodes.OK).json({
            message: "닉네임이 변경되었습니다.",
            user: {
                email: user.email,
                nickName: user.nickName
            }
        });
    } catch (error) {
        next(error);
    }
};

export const changePassword: RequestHandler<EmptyObject, MessageResponse, ChangePasswordRequest> = async (req: RequestWithUser, res, next): Promise<void> => {
    try {
        const { oldPassword, newPassword } = req.body;
        await changeUserPassword(req.user?.email, oldPassword, newPassword);

        res.status(StatusCodes.OK).json({
            message: "비밀번호가 변경되었습니다."
        });
    } catch (error) {
        next(error);
    }
};

export const refresh: RequestHandler = async (req, res, next): Promise<void> => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            res.status(StatusCodes.UNAUTHORIZED).json({
                message: "리프레시 토큰이 필요합니다."
            });
            return;
        }

        try {
            // 토큰 순환 메서드 사용
            await authMiddleware.rotateTokens(refreshToken, res);

            res.status(StatusCodes.OK).json({
                message: "토큰이 갱신되었습니다."
            });
        } catch (error) {
            // 토큰 재사용 시도 등의 보안 이슈 처리
            if (error instanceof AuthError &&
                (error.errorType === "INVALID_REFRESH_TOKEN" || error.errorType === "TOKEN_EXPIRED")) {
                // 클라이언트에게 재로그인 요청
                authMiddleware.clearAccessTokenCookie(res);
                authMiddleware.clearRefreshTokenCookie(res);

                res.status(StatusCodes.UNAUTHORIZED).json({
                    message: "보안상의 이유로 재로그인이 필요합니다.",
                    code: "SECURITY_RELOGIN_REQUIRED"
                });
                return;
            }

            next(error);
        }
    } catch (error) {
        next(error);
    }
};


