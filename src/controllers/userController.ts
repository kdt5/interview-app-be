import { NextFunction, Response, Request } from "express";
import { StatusCodes } from "http-status-codes";
import authService from "../services/authService.js";
import userService from "../services/userService.js";
import { AuthRequest } from "../middlewares/authMiddleware.js";

export interface UserInfoResponse {
  email: string;
  nickname: string;
  positionId: number;
  profileImageUrl?: string;
}

export async function getMe(
  req: Request,
  res: Response<UserInfoResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const request = req as AuthRequest;
    const user = await authService.getUserByEmail(request.user.email);

    res.status(StatusCodes.OK).json({
      email: user.email,
      nickname: user.nickname,
      positionId: user.positionId ?? 0,
      profileImageUrl: user.profileImageUrl,
    });
  } catch (error) {
    next(error);
  }
}

export async function getUserStats(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const request = req as AuthRequest;
    const userStats = await userService.getUserStats(request.user.userId);

    res.status(StatusCodes.OK).json(userStats);
  } catch (error) {
    next(error);
  }
}

interface ChangeNicknameRequest extends AuthRequest {
  body: {
    nickname: string;
  };
}

export async function changeNickname(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const request = req as ChangeNicknameRequest;
    const { nickname } = request.body;
    await authService.changeUserNickname(request.user.email, nickname);

    res.status(StatusCodes.OK).send();
  } catch (error) {
    next(error);
  }
}

interface ChangePasswordRequest extends AuthRequest {
  body: {
    oldPassword: string;
    newPassword: string;
  };
}

export async function changePassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const request = req as ChangePasswordRequest;
    const { oldPassword, newPassword } = request.body;
    await authService.changeUserPassword(
      request.user.email,
      oldPassword,
      newPassword
    );

    res.status(StatusCodes.OK).send();
  } catch (error) {
    next(error);
  }
}

interface RecoverPasswordRequest extends Request {
  body: {
    email: string;
  };
}

export async function recoverPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const request = req as RecoverPasswordRequest;
    const { email } = request.body;
    await authService.recoverUserPassword(email);

    res.status(StatusCodes.OK).send();
  } catch (error) {
    next(error);
  }
}
