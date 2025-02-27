import { hash, compare } from "bcrypt-ts";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import { User } from "@prisma/client";
import { DuplicateError, ValidationError, AuthError } from "../utils/errors/authError";

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


export const checkAvailability = async (item: string, type: AvailabilityCheckType): Promise<{ message: string }> => {
    const where = type === AvailabilityCheckType.EMAIL
        ? { email: item }
        : { nickName: item };

    const existingItem = await prisma.user.findUnique({ where });

    if (existingItem) {
        throw type === AvailabilityCheckType.EMAIL
            ? new DuplicateError("EMAIL_DUPLICATE")
            : new DuplicateError("NICKNAME_DUPLICATE");
    }

    return {
        message: type === AvailabilityCheckType.EMAIL
            ? "사용 가능한 이메일입니다."
            : "사용 가능한 닉네임입니다."
    };
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
    const user = await prisma.user.findUnique({
        where: { email: email }
    })

    if (!user) {
        throw new AuthError("UNAUTHORIZED");
    }

    const isValidPassword = await compare(password, user.password);
    if (!isValidPassword) {
        throw new ValidationError("INVALID_PASSWORD");
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new AuthError("SECRET_KEY_NOT_FOUND");
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
};

export const changeUserNickname = async (email: string | undefined, nickName: string): Promise<User> => {
    if (!email) {
        throw new AuthError("UNAUTHORIZED");
    }

    const existingNickname = await prisma.user.findUnique({
        where: { nickName: nickName }
    });

    if (existingNickname) {
        throw new DuplicateError("NICKNAME_DUPLICATE");
    }

    try {
        return await prisma.user.update({
            where: { email: email },
            data: { nickName: nickName }
        });
    } catch (error) {
        throw error;
    }
};

export const changeUserPassword = async (email: string | undefined, oldPassword: string, newPassword: string): Promise<User> => {
    if (!email) {
        throw new AuthError("UNAUTHORIZED");
    }

    const user = await prisma.user.findUnique({
        where: { email: email }
    });

    if (!user) {
        throw new AuthError("UNAUTHORIZED");
    }

    const isValidPassword = await compare(oldPassword, user.password);
    if (!isValidPassword) {
        throw new ValidationError("PASSWORD_MISMATCH");
    }

    try {
        const hashedPassword = await hash(newPassword, HASH_ROUNDS);
        return await prisma.user.update({
            where: { email: email },
            data: { password: hashedPassword }
        });
    } catch (error) {
        throw error;
    }
};

