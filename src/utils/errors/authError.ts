import { StatusCodes } from "http-status-codes";

interface ErrorType {
    code: string;
    message: string;
    internalMessage?: string;  // 보안상 노출하지 않는 메시지
}

// 인증 관련 에러
export const AUTH_ERROR_TYPES: Record<string, ErrorType> = {
    UNAUTHORIZED: {
        code: 'AUTH/UNAUTHORIZED',
        message: '인증이 필요합니다.'
    },
    INVALID_TOKEN: {
        code: 'AUTH/INVALID_TOKEN',
        message: '인증에 실패했습니다.',
        internalMessage: '유효하지 않은 토큰입니다.'
    },
    TOKEN_EXPIRED: {
        code: 'AUTH/TOKEN_EXPIRED',
        message: '인증에 실패했습니다.',
        internalMessage: '토큰이 만료되었습니다.'
    },
    REFRESH_TOKEN_FAILED: {
        code: 'AUTH/REFRESH_TOKEN_FAILED',
        message: '토큰 갱신에 실패했습니다.'
    },
    INVALID_REFRESH_TOKEN: {
        code: 'AUTH/INVALID_REFRESH_TOKEN',
        message: '인증에 실패했습니다.',
        internalMessage: '유효하지 않은 리프레시 토큰입니다.'
    },
    FORBIDDEN: {
        code: 'AUTH/FORBIDDEN',
        message: '접근 권한이 없습니다.'
    },
    SECRET_KEY_NOT_FOUND: {
        code: 'AUTH/SECRET_KEY_NOT_FOUND',
        message: '서버 설정 오류가 발생했습니다.',
        internalMessage: 'JWT 시크릿 키가 존재하지 않습니다.'
    },
    INVALID_AUTH_SCHEME: {
        code: 'AUTH/INVALID_AUTH_SCHEME',
        message: '유효하지 않은 인증 헤더입니다.'
    },
    INVALID_CSRF_TOKEN: {
        code: 'AUTH/INVALID_CSRF_TOKEN',
        message: '유효하지 않은 CSRF 토큰입니다.'
    },
    REFRESH_TOKEN_REQUIRED: {
        code: 'AUTH/REFRESH_TOKEN_REQUIRED',
        message: '리프레시 토큰이 필요합니다.'
    },
    SECURITY_RELOGIN_REQUIRED: {
        code: 'AUTH/SECURITY_RELOGIN_REQUIRED',
        message: '보안상의 이유로 재로그인이 필요합니다.',
        internalMessage: '잠재적 토큰 도난 또는 재사용 시도가 감지되었습니다.'
    },
    SESSION_EXPIRED: {
        code: 'AUTH/SESSION_EXPIRED',
        message: '세션이 만료되었습니다. 다시 로그인해주세요.'
    }
} as const;

// 유효성 검사 관련 에러
export const VALIDATION_ERROR_TYPES: Record<string, ErrorType> = {
    INVALID_PASSWORD: {
        code: 'VALIDATION/INVALID_PASSWORD',
        message: '입력하신 정보를 다시 확인해주세요.',
        internalMessage: '비밀번호가 올바르지 않습니다.'
    },
    INVALID_EMAIL: {
        code: 'VALIDATION/INVALID_EMAIL',
        message: '유효하지 않은 이메일 형식입니다.'
    },
    INVALID_NICKNAME: {
        code: 'VALIDATION/INVALID_NICKNAME',
        message: '유효하지 않은 닉네임 형식입니다.'
    },
    PASSWORD_MISMATCH: {
        code: 'VALIDATION/PASSWORD_MISMATCH',
        message: '입력하신 정보를 다시 확인해주세요.',
        internalMessage: '비밀번호가 올바르지 않습니다.'
    },
    PASSWORD_REQUIREMENTS: {
        code: 'VALIDATION/PASSWORD_REQUIREMENTS',
        message: '비밀번호는 8-30자의 소문자, 대문자, 숫자, 특수문자를 모두 포함해야 합니다.'
    }
} as const;

// 중복 검사 관련 에러
export const DUPLICATE_ERROR_TYPES: Record<string, ErrorType> = {
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
export const COMMON_ERROR_TYPES: Record<string, ErrorType> = {
    UNKNOWN_ERROR: {
        code: 'COMMON/UNKNOWN_ERROR',
        message: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        internalMessage: '알 수 없는 오류가 발생했습니다.'
    },
    DATABASE_ERROR: {
        code: 'COMMON/DATABASE_ERROR',
        message: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        internalMessage: '데이터베이스 작업 중 오류 발생'
    },
    NETWORK_ERROR: {
        code: 'COMMON/NETWORK_ERROR',
        message: '네트워크 연결을 확인해주세요.',
        internalMessage: '네트워크 통신 오류'
    }
} as const;



export class AuthError extends Error {
    public readonly code: string;
    private readonly internalMessage: string;

    constructor(
        public readonly errorType: keyof typeof AUTH_ERROR_TYPES,
        public readonly statusCode: StatusCodes = StatusCodes.UNAUTHORIZED
    ) {
        super(AUTH_ERROR_TYPES[errorType].message);
        this.name = 'AuthError';
        this.code = AUTH_ERROR_TYPES[errorType].code;
        this.internalMessage = AUTH_ERROR_TYPES[errorType].internalMessage || AUTH_ERROR_TYPES[errorType].message;
    }

    getInternalMessage(): string {
        return this.internalMessage;
    }
}

export class ValidationError extends Error {
    public readonly code: string;
    private readonly internalMessage: string;

    constructor(
        public readonly errorType: keyof typeof VALIDATION_ERROR_TYPES,
        public readonly statusCode: StatusCodes = StatusCodes.BAD_REQUEST
    ) {
        super(VALIDATION_ERROR_TYPES[errorType].message);
        this.name = 'ValidationError';
        this.code = VALIDATION_ERROR_TYPES[errorType].code;
        this.internalMessage = VALIDATION_ERROR_TYPES[errorType].internalMessage || VALIDATION_ERROR_TYPES[errorType].message;
    }

    getInternalMessage(): string {
        return this.internalMessage;
    }
}

export class DuplicateError extends Error {
    public readonly code: string;
    private readonly internalMessage: string;

    constructor(
        public readonly errorType: keyof typeof DUPLICATE_ERROR_TYPES,
        public readonly statusCode: StatusCodes = StatusCodes.CONFLICT
    ) {
        super(DUPLICATE_ERROR_TYPES[errorType].message);
        this.name = 'DuplicateError';
        this.code = DUPLICATE_ERROR_TYPES[errorType].code;
        this.internalMessage = DUPLICATE_ERROR_TYPES[errorType].internalMessage || DUPLICATE_ERROR_TYPES[errorType].message;
    }

    getInternalMessage(): string {
        return this.internalMessage;
    }
}

export class CommonError extends Error {
    public readonly code: string;
    private readonly internalMessage: string;

    constructor(
        public readonly errorType: keyof typeof COMMON_ERROR_TYPES,
        public readonly statusCode: StatusCodes = StatusCodes.INTERNAL_SERVER_ERROR
    ) {
        super(COMMON_ERROR_TYPES[errorType].message);
        this.name = 'CommonError';
        this.code = COMMON_ERROR_TYPES[errorType].code;
        this.internalMessage = COMMON_ERROR_TYPES[errorType].internalMessage || COMMON_ERROR_TYPES[errorType].message;
    }

    getInternalMessage(): string {
        return this.internalMessage;
    }
}


