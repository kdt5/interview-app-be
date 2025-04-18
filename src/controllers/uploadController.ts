import { StatusCodes } from "http-status-codes";
import { Request, Response, NextFunction } from "express";
import { UserInfo } from "../services/authService";
import uploadService from "../services/uploadService";

export async function uploadProfile(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = (req as Request & { user: UserInfo }).user.userId;
        const file = req.file as Express.MulterS3.File;

        if (!file) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: "업로드할 파일이 없습니다." });
            return;
        }

        const imageUrl = file.location;
        const updatedImageUrl = await uploadService.uploadImage(userId, imageUrl);

        res.status(StatusCodes.OK).json(updatedImageUrl);
    } catch (error) {
        next(error);
    }
}