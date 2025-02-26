import { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes'
import { hash, compare } from "bcrypt-ts";
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma'

export const signup: RequestHandler = async (req, res) => {
    try {
        const { user_id, password, nick_name } = req.body;

        // 아이디 중복 체크
        const existingUser = await prisma.user.findUnique({
            where: { userId: user_id }
        });
        if (existingUser) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: '이미 존재하는 아이디입니다.' });
            return;
        }

        // 비밀번호 해시화
        const hashedPassword = await hash(password, 10);

        // 사용자 생성
        const user = await prisma.user.create({
            data: {
                userId: user_id,
                password: hashedPassword,
                nickName: nick_name
            }
        });

        res.status(StatusCodes.CREATED).json({
            message: '회원가입이 완료되었습니다.',
            user: {
                userId: user.userId,
                nickName: user.nickName
            }
        });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '서버 오류가 발생했습니다.' });
    }
};

export const login: RequestHandler = async (req, res) => {
    try {
        const { user_id, password } = req.body;

        // 사용자 찾기
        const user = await prisma.user.findUnique({
            where: { userId: user_id }
        });
        if (!user) {
            res.status(StatusCodes.UNAUTHORIZED).json({ message: '아이디 또는 비밀번호가 잘못되었습니다.' });
            return;
        }

        // 비밀번호 확인
        const isValidPassword = await compare(password, user.password);
        if (!isValidPassword) {
            res.status(StatusCodes.UNAUTHORIZED).json({ message: '아이디 또는 비밀번호가 잘못되었습니다.' });
            return;
        }

        // JWT 토큰 생성
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1h' }
        );

        res.json({
            message: '로그인 성공',
            token,
            user: {
                userId: user.userId,
                nickName: user.nickName
            }
        });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '서버 오류가 발생했습니다.' });
    }
};

export const logout: RequestHandler = async (req, res) => {
    res.clearCookie('token');
    res.status(StatusCodes.OK).json({ message: '로그아웃 성공' });
};
