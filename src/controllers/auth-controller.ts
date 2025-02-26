import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { createUser, authenticateUser, checkAvailability } from "../services/auth-service";

interface SignupRequest {
    password: string;
    email: string;
    nickName: string;
}

interface LoginRequest {
    email: string;
    password: string;
}


export const checkEmailAvailability: RequestHandler = async (req, res): Promise<void> => {
    const { email } = req.body;

    const isEmailAvailable = await checkAvailability(email, "email");

    if (isEmailAvailable) {
        res.status(StatusCodes.OK).json({ message: "사용 가능한 이메일 입니다." });
    } else {
        res.status(StatusCodes.BAD_REQUEST).json({ message: "이미 사용 중인 이메일 입니다." });
    }
};

export const checkNicknameAvailability: RequestHandler = async (req, res): Promise<void> => {
    const { nickName } = req.body;

    const isNicknameAvailable = await checkAvailability(nickName, "nickName");

    if (isNicknameAvailable) {
        res.status(StatusCodes.OK).json({ message: "사용 가능한 닉네임 입니다." });
    } else {
        res.status(StatusCodes.BAD_REQUEST).json({ message: "이미 사용 중인 닉네임 입니다." });
    }
};

export const signup: RequestHandler<{}, {}, SignupRequest> = async (req, res): Promise<void> => {
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
        if (error instanceof Error) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
        } else {
            res.status(StatusCodes.BAD_REQUEST).json({ message: "알 수 없는 오류가 발생했습니다." });
        }
    }
};

export const login: RequestHandler<{}, {}, LoginRequest> = async (req, res): Promise<void> => {
    try {
        const { email, password } = req.body;

        const { user, token } = await authenticateUser(email, password);

        res.status(StatusCodes.OK).json({
            message: "로그인 성공",
            token,
            user: {
                email: user.email,
                nickName: user.nickName
            }
        });
    } catch (error) {
        if (error instanceof Error) {
            res.status(StatusCodes.UNAUTHORIZED).json({ message: error.message });
        } else {
            res.status(StatusCodes.UNAUTHORIZED).json({ message: "알 수 없는 오류가 발생했습니다." });
        }
    }
};

export const logout: RequestHandler = async (req, res): Promise<void> => {
    try {
        // JWT 토큰 확인
        const token = req.cookies.token;
        if (!token) {
            res.status(StatusCodes.UNAUTHORIZED).json({ message: "로그인이 필요합니다." });
            return;
        }

        // 쿠키 제거 및 응답
        res.clearCookie("token");
        res.status(StatusCodes.OK).json({ message: "로그아웃 성공" });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "로그아웃 처리 중 오류가 발생했습니다." });
    }
};
