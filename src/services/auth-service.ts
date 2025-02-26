import { hash, compare } from "bcrypt-ts";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import { User } from "@prisma/client";

const HASH_ROUNDS = 10;

type UserInfo = "email" | "nickName"

interface AuthResponse {
    user: Pick<User, UserInfo>;
    token: string;
}

export class AuthError extends Error {
    constructor(
        message: string,
        public readonly code: string = 'AUTH_ERROR'
    ) {
        super(message);
        this.name = 'AuthError';
    }
}

export const checkAvailability = async (item: string, type: UserInfo): Promise<boolean> => {
    const where = type === "email"
        ? { email: item }
        : { nickName: item };

    const existingItem = await prisma.user.findUnique({ where });
    return !existingItem;
};

export const createUser = async (password: string, email: string, nickName: string): Promise<User> => {
    const existingEmail = await prisma.user.findUnique({
        where: { email: email }
    });
    if (existingEmail) {
        throw new AuthError("이미 사용 중인 이메일 입니다.", "EMAIL_DUPLICATE");
    }

    // 비밀번호 해시화
    const hashedPassword = await hash(password, HASH_ROUNDS);

    // 사용자 생성
    return prisma.user.create({
        data: {
            password: hashedPassword,
            email: email,
            nickName: nickName
        }
    });
};

export const authenticateUser = async (email: string, password: string): Promise<AuthResponse> => {
    const user = await prisma.user.findUnique({
        where: { email: email }
    });
    if (!user) {
        throw new AuthError("이메일 또는 비밀번호가 잘못되었습니다.", "INVALID_CREDENTIALS");
    }

    // 비밀번호 확인
    const isValidPassword = await compare(password, user.password);
    if (!isValidPassword) {
        throw new AuthError("이메일 또는 비밀번호가 잘못되었습니다.", "INVALID_CREDENTIALS");
    }

    // JWT 토큰 생성
    const token = jwt.sign(
        { email: user.email },
        process.env.JWT_SECRET || "default-secret-key",
        { expiresIn: "1h" }
    );

    return {
        user: {
            email: user.email,
            nickName: user.nickName
        },
        token
    };
};
