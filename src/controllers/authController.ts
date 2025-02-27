import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { createUser, authenticateUser, checkAvailability, AvailabilityCheckType } from "../services/authService";
import { changeUserNickname, changeUserPassword } from "../services/authService";
import { RequestWithUser } from "../middlewares/authMiddleware";

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


