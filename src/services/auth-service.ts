import { hash, compare } from "bcrypt-ts";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";

export const createUser = async (user_id: string, password: string, nick_name: string) => {
    // 아이디 중복 체크
    const existingUser = await prisma.user.findUnique({
        where: { userId: user_id }
    });
    if (existingUser) {
        throw new Error("이미 존재하는 아이디입니다.");
    }

    // 비밀번호 해시화
    const hashedPassword = await hash(password, 10);

    // 사용자 생성
    return prisma.user.create({
        data: {
            userId: user_id,
            password: hashedPassword,
            nickName: nick_name
        }
    });
};

export const authenticateUser = async (user_id: string, password: string) => {
    // 사용자 조회
    const user = await prisma.user.findUnique({
        where: { userId: user_id }
    });
    if (!user) {
        throw new Error("아이디 또는 비밀번호가 잘못되었습니다.");
    }

    // 비밀번호 확인
    const isValidPassword = await compare(password, user.password);
    if (!isValidPassword) {
        throw new Error("아이디 또는 비밀번호가 잘못되었습니다.");
    }

    // JWT 토큰 생성
    const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "1h" }
    );

    return { user, token };
};
