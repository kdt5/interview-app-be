import { StatusCodes } from "http-status-codes";

// 인증 관련 에러
export const AUTH_ERROR_TYPES = {
    UNAUTHORIZED: {
        code: 'AUTH/UNAUTHORIZED',
        message: '인증이 필요합니다.'
    },
    INVALID_TOKEN: {
        code: 'AUTH/INVALID_TOKEN',
        message: '유효하지 않은 토큰입니다.'
    },
    TOKEN_EXPIRED: {
        code: 'AUTH/TOKEN_EXPIRED',
        message: '토큰이 만료되었습니다.'
    },
    FORBIDDEN: {
        code: 'AUTH/FORBIDDEN',
        message: '접근 권한이 없습니다.'
    }
} as const;

// 유효성 검사 관련 에러
export const VALIDATION_ERROR_TYPES = {
    INVALID_PASSWORD: {
        code: 'VALIDATION/INVALID_PASSWORD',
        message: '비밀번호가 올바르지 않습니다.'
    },
    INVALID_EMAIL: {
        code: 'VALIDATION/INVALID_EMAIL',
        message: '유효하지 않은 이메일 형식입니다.'
    },
    INVALID_NICKNAME: {
        code: 'VALIDATION/INVALID_NICKNAME',
        message: '유효하지 않은 닉네임 형식입니다.'
    }
} as const;

// 중복 검사 관련 에러
export const DUPLICATE_ERROR_TYPES = {
    NICKNAME_DUPLICATE: {
        code: 'DUPLICATE/NICKNAME',
        message: '이미 사용 중인 닉네임입니다.'
    },
    EMAIL_DUPLICATE: {
        code: 'DUPLICATE/EMAIL',
        message: '이미 사용 중인 이메일입니다.'
    }
} as const;

// 공통 에러
export const COMMON_ERROR_TYPES = {
    UNKNOWN_ERROR: {
        code: 'COMMON/UNKNOWN_ERROR',
        message: '알 수 없는 오류가 발생했습니다.'
    }
} as const;

export class AuthError extends Error {
    public readonly code: string;

    constructor(
        public readonly errorType: keyof typeof AUTH_ERROR_TYPES,
        public readonly statusCode: StatusCodes = StatusCodes.UNAUTHORIZED
    ) {
        super(AUTH_ERROR_TYPES[errorType].message);
        this.name = 'AuthError';
        this.code = AUTH_ERROR_TYPES[errorType].code;
    }
}

export class ValidationError extends Error {
    public readonly code: string;

    constructor(
        public readonly errorType: keyof typeof VALIDATION_ERROR_TYPES,
        public readonly statusCode: StatusCodes = StatusCodes.BAD_REQUEST
    ) {
        super(VALIDATION_ERROR_TYPES[errorType].message);
        this.name = 'ValidationError';
        this.code = VALIDATION_ERROR_TYPES[errorType].code;
    }
}

export class DuplicateError extends Error {
    public readonly code: string;

    constructor(
        public readonly errorType: keyof typeof DUPLICATE_ERROR_TYPES,
        public readonly statusCode: StatusCodes = StatusCodes.CONFLICT
    ) {
        super(DUPLICATE_ERROR_TYPES[errorType].message);
        this.name = 'DuplicateError';
        this.code = DUPLICATE_ERROR_TYPES[errorType].code;
    }
}

export class CommonError extends Error {
    public readonly code: string;

    constructor(
        public readonly errorType: keyof typeof COMMON_ERROR_TYPES,
        public readonly statusCode: StatusCodes = StatusCodes.INTERNAL_SERVER_ERROR
    ) {
        super(COMMON_ERROR_TYPES[errorType].message);
        this.name = 'CommonError';
        this.code = COMMON_ERROR_TYPES[errorType].code;
    }
}


