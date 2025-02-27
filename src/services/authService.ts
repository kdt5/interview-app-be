import { hash, compare } from "bcrypt-ts";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import { User } from "@prisma/client";
import { DuplicateError, ValidationError, AuthError, CommonError } from "../utils/errors/authError";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const HASH_ROUNDS = 10;

export interface UserInfo {
    email: string;
    nickName: string;
}

export interface AuthResponse {
    user: UserInfo;
    token: string;
}

export enum AvailabilityCheckType {
    EMAIL = "email",
    NICKNAME = "nickName"
}


export const checkAvailability = async (item: string, type: AvailabilityCheckType): Promise<boolean> => {
    const where = type === AvailabilityCheckType.EMAIL
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
        throw new DuplicateError("EMAIL_DUPLICATE");
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
    try {
        const user = await prisma.user.findUnique({
            where: { email: email }
        });

        if (!user) {
            const error = new AuthError("UNAUTHORIZED");
            console.error(`Authentication failed: ${error.getInternalMessage()}`);
            throw error;
        }

        const isValidPassword = await compare(password, user.password);
        if (!isValidPassword) {
            const error = new ValidationError("INVALID_PASSWORD");
            console.error(`Password validation failed: ${error.getInternalMessage()}`);
            throw error;
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            const error = new AuthError("SECRET_KEY_NOT_FOUND");
            console.error(`JWT Secret error: ${error.getInternalMessage()}`);
            throw error;
        }

        const token = jwt.sign(
            { email: user.email },
            secret,
            { expiresIn: "1h" }
        );

        return {
            user: {
                email: user.email,
                nickName: user.nickName
            },
            token
        };
    } catch (error) {
        // Prisma 에러 처리
        if (error instanceof PrismaClientKnownRequestError) {
            console.error(`Database error: ${error.code}`, error);
            throw new CommonError("UNKNOWN_ERROR");
        }
        throw error;
    }
};

export const changeUserNickname = async (email: string, nickName: string): Promise<User> => {
    const existingNickname = await prisma.user.findUnique({
        where: { nickName: nickName }
    });

    if (existingNickname) {
        throw new DuplicateError("NICKNAME_DUPLICATE");
    }

    return prisma.user.update({
        where: { email: email },
        data: { nickName: nickName }
    });
};

export const changeUserPassword = async (email: string, oldPassword: string, newPassword: string): Promise<User> => {
    const user = await prisma.user.findUnique({
        where: { email: email }
    });
    if (!user) {
        throw new AuthError("UNAUTHORIZED");
    }

    // 기존 비밀번호 확인
    const isValidPassword = await compare(oldPassword, user.password);
    if (!isValidPassword) {
        throw new ValidationError("INVALID_PASSWORD");
    }
    const hashedPassword = await hash(newPassword, HASH_ROUNDS);

    return prisma.user.update({
        where: { email: email },
        data: { password: hashedPassword }
    });
};

