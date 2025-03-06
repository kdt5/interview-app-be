import { NextFunction, RequestHandler, Response } from "express";
import { StatusCodes } from "http-status-codes";
import {
  changeUserNickname,
  changeUserPassword,
  getUserByEmail,
} from "../services/authService.js";
import { RequestWithUser } from "../middlewares/authMiddleware.js";

interface ChangeNicknameRequest {
  nickName: string;
}

interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export const getMe = (async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await getUserByEmail(req.user.email);

    res.status(StatusCodes.OK).json({
      email: user.email,
      nickName: user.nickName,
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler;

export const changeNickname = (async (
  req: RequestWithUser & { body: ChangeNicknameRequest },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { nickName } = req.body;
    await changeUserNickname(req.user.email, nickName);

    res.status(StatusCodes.OK).send();
  } catch (error) {
    next(error);
  }
}) as RequestHandler;

export const changePassword = (async (
  req: RequestWithUser & { body: ChangePasswordRequest },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { oldPassword, newPassword } = req.body;
    await changeUserPassword(req.user.email, oldPassword, newPassword);

    res.status(StatusCodes.OK).send();
  } catch (error) {
    next(error);
  }
}) as RequestHandler;
