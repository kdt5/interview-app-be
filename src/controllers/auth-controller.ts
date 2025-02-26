import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { createUser, authenticateUser, checkAvailability, AvailabilityCheckType } from "../services/auth-service";
import { changeUserNickname, changeUserPassword } from "../services/auth-service";
import { RequestWithUser } from "../middlewares/auth-middleware";
import { DuplicateError, AuthError, ValidationError } from "../utils/errors/auth-error";
// 응답 메시지 상수
export const RESPONSE_MESSAGES = {
    AVAILABLE_EMAIL: "사용 가능한 이메일입니다.",
    UNAVAILABLE_EMAIL: "이미 사용 중인 이메일입니다.",
    AVAILABLE_NICKNAME: "사용 가능한 닉네임입니다.",
    UNAVAILABLE_NICKNAME: "이미 사용 중인 닉네임입니다.",
    SIGNUP_SUCCESS: "회원가입이 완료되었습니다.",
    LOGIN_SUCCESS: "로그인이 완료되었습니다.",
    LOGOUT_SUCCESS: "로그아웃이 완료되었습니다.",
    NICKNAME_CHANGE_SUCCESS: "닉네임이 변경되었습니다.",
    PASSWORD_CHANGE_SUCCESS: "비밀번호가 변경되었습니다."
} as const;

// 에러 메시지 상수
export const ERROR_MESSAGES = {
    UNAUTHORIZED: "인증이 필요합니다.",
    UNKNOWN_ERROR: "알 수 없는 오류가 발생했습니다."
} as const;

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

export const checkEmailAvailability: RequestHandler<{}, {}, CheckEmailAvailabilityRequest> = async (req, res): Promise<void> => {
    const { email } = req.body;

    try {
        const isEmailAvailable = await checkAvailability(email, AvailabilityCheckType.EMAIL);

        if (isEmailAvailable) {
            res.status(StatusCodes.OK).json({ message: RESPONSE_MESSAGES.AVAILABLE_EMAIL });
        } else {
            res.status(StatusCodes.CONFLICT).json({ message: RESPONSE_MESSAGES.UNAVAILABLE_EMAIL });
        }
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.UNKNOWN_ERROR });
    }
};

export const checkNicknameAvailability: RequestHandler<{}, {}, CheckNicknameAvailabilityRequest> = async (req, res): Promise<void> => {
    const { nickName } = req.body;

    try {
        const isNicknameAvailable = await checkAvailability(nickName, AvailabilityCheckType.NICKNAME);

        if (isNicknameAvailable) {
            res.status(StatusCodes.OK).json({ message: RESPONSE_MESSAGES.AVAILABLE_NICKNAME });
        } else {
            res.status(StatusCodes.BAD_REQUEST).json({ message: RESPONSE_MESSAGES.UNAVAILABLE_NICKNAME });
        }
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.UNKNOWN_ERROR });
    }
};

export const signup: RequestHandler<{}, {}, SignupRequest> = async (req, res): Promise<void> => {
    try {
        const { password, email, nickName } = req.body;

        const user = await createUser(password, email, nickName);

        res.status(StatusCodes.CREATED).json({
            message: RESPONSE_MESSAGES.SIGNUP_SUCCESS,
            user: {
                email: user.email,
                nickName: user.nickName
            }
        });
    } catch (error) {
        if (error instanceof DuplicateError) {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.UNKNOWN_ERROR });
        }
    }
};

export const login: RequestHandler<{}, {}, LoginRequest> = async (req, res): Promise<void> => {
    try {
        const { email, password } = req.body;

        const { user, token } = await authenticateUser(email, password);

        res.status(StatusCodes.OK).json({
            message: RESPONSE_MESSAGES.LOGIN_SUCCESS,
            token,
            user: {
                email: user.email,
                nickName: user.nickName
            }
        });
    } catch (error) {
        if (error instanceof AuthError) {
            res.status(error.statusCode).json({ message: error.message });
        } else if (error instanceof ValidationError) {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.UNKNOWN_ERROR });
        }
    }
};

export const logout: RequestHandler = async (req, res): Promise<void> => {
    res.clearCookie("token");
    res.status(StatusCodes.OK).json({ message: RESPONSE_MESSAGES.LOGOUT_SUCCESS });
};

export const changeNickname: RequestHandler<{}, {}, ChangeNicknameRequest> = async (req: RequestWithUser, res): Promise<void> => {
    try {
        const { nickName } = req.body;
        const email = req.user?.email;

        if (!email) {
            res.status(StatusCodes.UNAUTHORIZED).json({ message: ERROR_MESSAGES.UNAUTHORIZED });
            return;
        }

        const user = await changeUserNickname(email, nickName);

        res.status(StatusCodes.OK).json({
            message: RESPONSE_MESSAGES.NICKNAME_CHANGE_SUCCESS,
            user: {
                email: user.email,
                nickName: user.nickName
            }
        });
    } catch (error) {
        if (error instanceof DuplicateError) {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.UNKNOWN_ERROR });
        }
    }
};

export const changePassword: RequestHandler<{}, {}, ChangePasswordRequest> = async (req: RequestWithUser, res): Promise<void> => {
    try {
        const { oldPassword, newPassword } = req.body;
        const email = req.user?.email;

        if (!email) {
            res.status(StatusCodes.UNAUTHORIZED).json({ message: ERROR_MESSAGES.UNAUTHORIZED });
            return;
        }

        await changeUserPassword(email, oldPassword, newPassword);

        res.status(StatusCodes.OK).json({
            message: RESPONSE_MESSAGES.PASSWORD_CHANGE_SUCCESS
        });
    } catch (error) {
        if (error instanceof AuthError) {
            res.status(error.statusCode).json({ message: error.message });
        } else if (error instanceof ValidationError) {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.UNKNOWN_ERROR });
        }
    }
};


