import { NextFunction, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { authService } from "../services/authService.js";
import { RequestWithUser } from "../middlewares/authMiddleware.js";

interface ChangeNicknameRequest extends RequestWithUser {
  body: {
    nickname: string;
  };
}

interface ChangePasswordRequest extends RequestWithUser {
  body: {
    oldPassword: string;
    newPassword: string;
  };
}

export async function getMe(
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await authService.getUserByEmail(req.user.email);

    res.status(StatusCodes.OK).json({
      email: user.email,
      nickname: user.nickname,
    });
  } catch (error) {
    next(error);
  }
}

export async function changeNickname(
  req: ChangeNicknameRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { nickname } = req.body;
    await authService.changeUserNickname(req.user.email, nickname);

    res.status(StatusCodes.OK).send();
  } catch (error) {
    next(error);
  }
}

export async function changePassword(
  req: ChangePasswordRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { oldPassword, newPassword } = req.body;
    await authService.changeUserPassword(
      req.user.email,
      oldPassword,
      newPassword
    );

    res.status(StatusCodes.OK).send();
  } catch (error) {
    next(error);
  }
}
