import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { RequestWithUser } from "../middlewares/authMiddleware.js";
import {
  changeUserNickname,
  changeUserPassword,
  getUserByEmail,
} from "../services/authService.js";
import { EmptyObject, UserResponse } from "./authController.js";
import { AuthError } from "../constants/errors/authError.js";

interface ChangeNicknameRequest {
  nickName: string;
}

interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export const getMe: RequestHandler<
  EmptyObject,
  UserResponse,
  EmptyObject
> = async (req: RequestWithUser, res, next): Promise<void> => {
  try {
    if (!req.user?.email) {
      throw new AuthError("UNAUTHORIZED");
    }

    const user = await getUserByEmail(req.user.email);

    res.status(StatusCodes.OK).json({
      email: user.email,
      nickName: user.nickName,
    });
  } catch (error) {
    next(error);
  }
};

export const changeNickname: RequestHandler<
  EmptyObject,
  void,
  ChangeNicknameRequest
> = async (req: RequestWithUser, res, next): Promise<void> => {
  try {
    const { nickName } = req.body;
    await changeUserNickname(req.user?.email, nickName);

    res.status(StatusCodes.OK).send();
  } catch (error) {
    next(error);
  }
};

export const changePassword: RequestHandler<
  EmptyObject,
  void,
  ChangePasswordRequest
> = async (req: RequestWithUser, res, next): Promise<void> => {
  try {
    const { oldPassword, newPassword } = req.body;
    await changeUserPassword(req.user?.email, oldPassword, newPassword);

    res.status(StatusCodes.OK).send();
  } catch (error) {
    next(error);
  }
};
