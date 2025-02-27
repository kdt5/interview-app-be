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
        if (error instanceof PrismaClientKnownRequestError) {
            throw new CommonError("DATABASE_ERROR");
        }
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
        if (error instanceof PrismaClientKnownRequestError) {
            throw new CommonError("DATABASE_ERROR");
        }
        throw error;
    }
};

