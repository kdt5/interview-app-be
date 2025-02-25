import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes'

export const validateSignup = (req: Request, res: Response, next: NextFunction): void => {
    const { user_id, password, nick_name } = req.body;

    if (!user_id || !password || !nick_name) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: '모든 필드를 입력해주세요.' });
        return;
    }

    if (password.length < 6) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: '비밀번호는 최소 6자 이상이어야 합니다.' });
        return;
    }

    next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
    const { user_id, password } = req.body;

    if (!user_id || !password) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: '아이디와 비밀번호를 모두 입력해주세요.' });
        return;
    }

    next();
};