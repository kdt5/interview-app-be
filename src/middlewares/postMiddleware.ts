import { Request, Response, NextFunction } from "express";
import { UserInfo } from "../services/authService";
import { StatusCodes } from "http-status-codes";
import prisma from "../lib/prisma";

const postMiddleware = {
    checkPostOwnership,
    isValidPostCategory,
};

export default postMiddleware;

export async function checkPostOwnership (
    req: Request & { user?: UserInfo },
    res: Response,
    next: NextFunction
): Promise<void> {
    const { postId } = req.params;
    const user = req.user as UserInfo;
    const userId = user.userId;

    try {
        const post = await prisma.communityPost.findUnique({
            where: { id: parseInt(postId) },
            select: { userId: true },
        });

        if(!post) {
            res.status(StatusCodes.NOT_FOUND).json({ message: "조건에 해당하는 게시물이 존재하지 않습니다." });
            return;
        }

        if(post.userId !== userId) {
            res.status(StatusCodes.FORBIDDEN).json({ message: "다른 사용자의 게시물은 접근 불가합니다." });
            return;
        }

        next();
    } catch (error) {
        next(error);
    }
}

export async function isValidPostCategory(categoryId: number): Promise<boolean> {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
  
    return !!category;
  }