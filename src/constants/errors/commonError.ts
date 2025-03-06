import { StatusCodes } from "http-status-codes";

export const COMMON_ERROR = {
  UNKNOWN_ERROR: "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  DATABASE_ERROR: "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  NETWORK_ERROR: "네트워크 연결을 확인해주세요.",
} as const;

export abstract class BaseError<
  T extends Record<string, string>
> extends Error {
  statusCode: StatusCodes;
  errorType: keyof T;

  constructor(errorTypes: T, errorType: keyof T, statusCode: StatusCodes) {
    super(errorTypes[errorType]);
    this.statusCode = statusCode;
    this.errorType = errorType;
  }
}

export class CommonError extends BaseError<typeof COMMON_ERROR> {
  constructor(
    errorType: keyof typeof COMMON_ERROR,
    statusCode: StatusCodes = StatusCodes.INTERNAL_SERVER_ERROR
  ) {
    super(COMMON_ERROR, errorType, statusCode);
  }
}
