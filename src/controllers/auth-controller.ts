import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { createUser, authenticateUser } from "../services/auth-service";

export const signup: RequestHandler = async (req, res) => {
    try {
        const { userId, password, email, nickName } = req.body;

        const user = await createUser(userId, password, email, nickName);

        res.status(StatusCodes.CREATED).json({
            message: "회원가입이 완료되었습니다.",
            user: {
                userId: user.userId,
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

export const login: RequestHandler = async (req, res) => {
    try {
        const { user_id, password } = req.body;

        const { user, token } = await authenticateUser(user_id, password);

        res.json({
            message: "로그인 성공",
            token,
            user: {
                userId: user.userId,
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

export const logout: RequestHandler = async (req, res) => {
    res.clearCookie("token");
    res.status(StatusCodes.OK).json({ message: "로그아웃 성공" });
};
