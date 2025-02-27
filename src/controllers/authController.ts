import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { createUser, authenticateUser, checkAvailability, AvailabilityCheckType } from "../services/authService";
import { changeUserNickname, changeUserPassword } from "../services/authService";
import { RequestWithUser } from "../middlewares/authMiddleware";
import { DuplicateError, AuthError } from "../utils/errors/authError";

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
        const isEmailAvailable = await checkAvailability(email, AvailabilityCheckType.EMAIL);

        if (isEmailAvailable) {
            res.status(StatusCodes.OK).json({ message: "사용 가능한 이메일입니다." });
        } else {
            throw new DuplicateError("EMAIL_DUPLICATE");
        }
    } catch (error) {
        next(error);
    }
};

export const checkNicknameAvailability: RequestHandler<{}, {}, CheckNicknameAvailabilityRequest> = async (req, res, next): Promise<void> => {
    try {
        const { nickName } = req.body;
        const isNicknameAvailable = await checkAvailability(nickName, AvailabilityCheckType.NICKNAME);

        if (isNicknameAvailable) {
            res.status(StatusCodes.OK).json({ message: "사용 가능한 닉네임입니다." });
        } else {
            throw new DuplicateError("NICKNAME_DUPLICATE");
        }
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
        const { user, token } = await authenticateUser(email, password);

        res.status(StatusCodes.OK).json({
            message: "로그인이 완료되었습니다.",
            token,
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
    res.clearCookie("token");
    res.status(StatusCodes.OK).json({ message: "로그아웃이 완료되었습니다." });
};

export const changeNickname: RequestHandler<{}, {}, ChangeNicknameRequest> = async (req: RequestWithUser, res, next): Promise<void> => {
    try {
        const { nickName } = req.body;
        const email = req.user?.email;

        if (!email) {
            throw new AuthError("UNAUTHORIZED");
        }

        const user = await changeUserNickname(email, nickName);

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
        const email = req.user?.email;

        if (!email) {
            throw new AuthError("UNAUTHORIZED");
        }

        await changeUserPassword(email, oldPassword, newPassword);

        res.status(StatusCodes.OK).json({
            message: "비밀번호가 변경되었습니다."
        });
    } catch (error) {
        next(error);
    }
};


