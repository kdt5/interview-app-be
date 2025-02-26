import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes'

export const validateSignup = (req: Request, res: Response, next: NextFunction): void => {
    const { userId, password, nickName } = req.body;

    if (!userId || !password || !nickName) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: '모든 필드를 입력해주세요.' });
        return;
    }

    const userIdRegex = /^[a-zA-Z0-9_@\.]{4,20}$/;
    if (!userIdRegex.test(userId)) {
        res.status(StatusCodes.BAD_REQUEST).json({
            message: '사용자 ID는 4-20자의 영문자, 숫자, 언더스코어, @(앳), .(마침표)만 사용 가능합니다.'
        });
        return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,30}$/;
    if (!passwordRegex.test(password)) {
        res.status(StatusCodes.BAD_REQUEST).json({
            message: '비밀번호는 8-30자의 대소문자, 숫자, 특수문자를 포함해야 합니다.'
        });
        return;
    }

    if (password.toLowerCase().includes(userId.toLowerCase())) {
        res.status(StatusCodes.BAD_REQUEST).json({
            message: '비밀번호에 사용자 ID를 포함할 수 없습니다.'
        });
        return;
    }

    const nickNameRegex = /^[가-힣a-zA-Z0-9]{2,16}$/;
    if (!nickNameRegex.test(nickName)) {
        res.status(StatusCodes.BAD_REQUEST).json({
            message: '닉네임은 2-16자의 한글, 영문자, 숫자만 사용 가능합니다.'
        });
        return;
    }

    next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
    const { userId, password } = req.body;

    if (!userId || !password) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: '아이디와 비밀번호를 모두 입력해주세요.' });
        return;
    }

    next();
};