import { StatusCodes } from "http-status-codes";
import { Request, Response, NextFunction } from "express";
import { UserInfo } from "../services/authService";
import communityService from "../services/communityService";

export async function createPost(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const { title, content } = req.body;
        const userId = (req as Request & { user: UserInfo }).user.userId;

        const newPost = await communityService.createPost(userId, title, content);

        res.status(StatusCodes.CREATED).json(newPost);

    } catch (error) {
        next(error);
    }
}