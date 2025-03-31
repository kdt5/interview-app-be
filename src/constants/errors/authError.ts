import { StatusCodes } from "http-status-codes";
import { BaseError } from "./commonError.js";

export const AUTH_ERROR = {
  UNAUTHORIZED: "인증이 필요합니다.",
  INVALID_TOKEN: "인증에 실패했습니다.",
  TOKEN_EXPIRED: "인증에 실패했습니다.",
  REFRESH_TOKEN_FAILED: "토큰 갱신에 실패했습니다.",
  INVALID_REFRESH_TOKEN: "유효하지 않은 리프레시 토큰입니다.",
  FORBIDDEN: "접근 권한이 없습니다.",
  SECRET_KEY_NOT_FOUND: "서버 설정 오류가 발생했습니다.",
  INVALID_AUTH_SCHEME: "유효하지 않은 인증 헤더입니다.",
  INVALID_CSRF_TOKEN: "유효하지 않은 CSRF 토큰입니다.",
  REFRESH_TOKEN_REQUIRED: "리프레시 토큰이 필요합니다.",
  ACCESS_TOKEN_REQUIRED: "액세스 토큰이 필요합니다.",
  SECURITY_RELOGIN_REQUIRED: "보안상의 이유로 재로그인이 필요합니다.",
  SESSION_EXPIRED: "세션이 만료되었습니다. 다시 로그인해주세요.",
  NOT_FOUND_USER: "입력하신 정보를 다시 확인해주세요.",
  INVALID_PASSWORD: "입력하신 정보를 다시 확인해주세요.",
  PASSWORD_MISMATCH: "입력하신 정보를 다시 확인해주세요.",
  RESET_TOKEN_EXPIRED: "만료된 토큰입니다.",
  INVALID_RESET_TOKEN: "유효하지 않은 토큰입니다.",
  PASSWORD_RESET_FAILED: "비밀번호 재설정에 실패했습니다.",
  EMAIL_SEND_FAILED: "이메일 전송에 실패했습니다.",
} as const;

export const VALIDATION_ERROR = {
  INVALID_EMAIL: "유효하지 않은 이메일 형식입니다.",
  INVALID_NICKNAME: "유효하지 않은 닉네임 형식입니다.",
  PASSWORD_REQUIREMENTS:
    "비밀번호는 8-30자의 소문자, 대문자, 숫자, 특수문자를 모두 포함해야 합니다.",
  INVALID_POSITION_ID: "유효하지 않은 직무 ID입니다.",
  INVALID_TOKEN: "유효하지 않은 토큰입니다.",
} as const;

export const DUPLICATE_ERROR = {
  NICKNAME_DUPLICATE: "이미 사용 중인 닉네임입니다.",
  EMAIL_DUPLICATE: "이미 사용 중인 이메일입니다.",
} as const;

export class AuthError extends BaseError<typeof AUTH_ERROR> {
  constructor(errorType: keyof typeof AUTH_ERROR) {
    super(AUTH_ERROR, errorType, StatusCodes.UNAUTHORIZED);
  }
}

export class ValidationError extends BaseError<typeof VALIDATION_ERROR> {
  constructor(errorType: keyof typeof VALIDATION_ERROR) {
    super(VALIDATION_ERROR, errorType, StatusCodes.BAD_REQUEST);
  }
}

export class DuplicateError extends BaseError<typeof DUPLICATE_ERROR> {
  constructor(errorType: keyof typeof DUPLICATE_ERROR) {
    super(DUPLICATE_ERROR, errorType, StatusCodes.CONFLICT);
  }
}
