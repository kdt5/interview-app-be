import { StatusCodes } from "http-status-codes";

export interface ErrorType {
  code: string;
  message: string;
  internalMessage?: string; // 보안상 노출하지 않는 메시지
}

export abstract class BaseError extends Error {
  public readonly code: string;
  private readonly internalMessage: string;

  constructor(
    errorTypes: Record<string, ErrorType>,
    public readonly errorType: string,
    public readonly statusCode: StatusCodes,
    public readonly name: string
  ) {
    super(errorTypes[errorType].message);
    this.name = name;
    this.code = errorTypes[errorType].code;
    this.internalMessage =
      errorTypes[errorType].internalMessage || errorTypes[errorType].message;
  }

  getInternalMessage(): string {
    return this.internalMessage;
  }
}

// 공통 에러
export const COMMON_ERROR_TYPES: Record<string, ErrorType> = {
  UNKNOWN_ERROR: {
    code: "COMMON/UNKNOWN_ERROR",
    message: "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  },
  DATABASE_ERROR: {
    code: "COMMON/DATABASE_ERROR",
    message: "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
    internalMessage: "데이터베이스 작업 중 오류 발생",
  },
  NETWORK_ERROR: {
    code: "COMMON/NETWORK_ERROR",
    message: "네트워크 연결을 확인해주세요.",
  },
} as const;

export class CommonError extends BaseError {
  constructor(
    errorType: keyof typeof COMMON_ERROR_TYPES,
    statusCode: StatusCodes = StatusCodes.INTERNAL_SERVER_ERROR
  ) {
    super(COMMON_ERROR_TYPES, errorType, statusCode, "CommonError");
  }
}
