import { Request, Response, NextFunction, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { VALIDATION_ERROR } from "../constants/errors/authError.js";

interface ValidationRule {
  test: (value: string) => boolean;
  message: string;
}

const validationRules = {
  password: {
    test: (value: string) =>
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,30}$/.test(
        value
      ),
    message: VALIDATION_ERROR.PASSWORD_REQUIREMENTS,
  },
  email: {
    test: (value: string) =>
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(value) &&
      value.length <= 254,
    message: VALIDATION_ERROR.INVALID_EMAIL,
  },
  nickname: {
    test: (value: string) => /^[가-힣a-zA-Z0-9]{2,16}$/.test(value),
    message: VALIDATION_ERROR.INVALID_NICKNAME,
  },
} as const;

const validateField = (
  value: string | undefined,
  fieldName: string,
  rule?: ValidationRule
): string | null => {
  if (!value) {
    return `${fieldName}을(를) 입력해주세요.`;
  }
  if (rule && !rule.test(value)) {
    return rule.message;
  }
  return null;
};

function createValidator(fields: {
  [key: string]: ValidationRule | undefined;
}): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    for (const [fieldName, rule] of Object.entries(fields)) {
      const value = req.body[fieldName];
      const error = validateField(value, fieldName, rule);

      if (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: error });
        return;
      }
    }
    next();
  };
}

export const validateNickname = createValidator({
  nickname: validationRules.nickname,
});

export const validatePassword = createValidator({
  oldPassword: undefined,
  newPassword: validationRules.password,
});

export const validateEmail = createValidator({
  email: validationRules.email,
});

export const validateSignup = createValidator({
  email: validationRules.email,
  password: validationRules.password,
  nickname: validationRules.nickname,
});

export const validateLogin = createValidator({
  email: validationRules.email,
  password: undefined, // 로그인 시에는 패스워드 형식 검사 불필요
});
