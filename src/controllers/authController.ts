import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { createUser, authenticateUser, checkAvailability, AvailabilityCheckType, refreshTokens } from "../services/authService.js";
import { changeUserNickname, changeUserPassword } from "../services/authService.js";
import { RequestWithUser } from "../middlewares/authMiddleware.js";
import authMiddleware from '../middlewares/authMiddleware.js';

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

export const checkEmailAvailability: RequestHandler<{}, {}, CheckEmailAvailabilityRequest> = async (req, res, next): Promise<void> => {
    try {
        const { email } = req.body;
        const result = await checkAvailability(email, AvailabilityCheckType.EMAIL);
        res.status(StatusCodes.OK).json({ message: result.message });
    } catch (error) {
        next(error);
    }
};

export const checkNicknameAvailability: RequestHandler<{}, {}, CheckNicknameAvailabilityRequest> = async (req, res, next): Promise<void> => {
    try {
        const { nickName } = req.body;
        const result = await checkAvailability(nickName, AvailabilityCheckType.NICKNAME);
        res.status(StatusCodes.OK).json({ message: result.message });
    } catch (error) {
        next(error);
    }
};

export const signup: RequestHandler<{}, {}, SignupRequest> = async (req, res, next): Promise<void> => {
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

export const login: RequestHandler<{}, {}, LoginRequest> = async (req, res, next): Promise<void> => {
    try {
        const { email, password } = req.body;
        const { user, accessToken, refreshToken } = await authenticateUser(email, password);

        // 리프레시 토큰을 HTTP 전용 쿠키로 설정
        authMiddleware.setRefreshTokenCookie(res, refreshToken);

        res.status(StatusCodes.OK).json({
            message: "로그인이 완료되었습니다.",
            accessToken,
            user: {
                email: user.email,
                nickName: user.nickName
            }
        });
    } catch (error) {
        next(error);
    }
};

export const logout: RequestHandler = async (req, res): Promise<void> => {
    // 리프레시 토큰 쿠키 삭제
    authMiddleware.clearRefreshTokenCookie(res);

    res.status(StatusCodes.OK).json({ message: "로그아웃이 완료되었습니다." });
};

export const changeNickname: RequestHandler<{}, {}, ChangeNicknameRequest> = async (req: RequestWithUser, res, next): Promise<void> => {
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

export const changePassword: RequestHandler<{}, {}, ChangePasswordRequest> = async (req: RequestWithUser, res, next): Promise<void> => {
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

        const { accessToken, refreshToken: newRefreshToken } = await refreshTokens(refreshToken);

        // 새 리프레시 토큰을 쿠키에 설정
        authMiddleware.setRefreshTokenCookie(res, newRefreshToken);

        res.status(StatusCodes.OK).json({
            message: "토큰이 갱신되었습니다.",
            accessToken
        });
    } catch (error) {
        next(error);
    }
};


