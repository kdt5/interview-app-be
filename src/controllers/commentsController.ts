import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import commentService from "../services/commentService.js";
import userService from "../services/userService.js";
import { POST_COMMENT_POINTS } from "../constants/levelUpPoints.js";
import { DEFAULT_PAGINATION_OPTIONS } from "../constants/pagination.js";

interface GetCommentsRequest extends Request {
  params: {
    targetId: string;
  };
  query: {
    categoryName: string;
    limit: string;
    page: string;
  };
}

export async function getComments(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const request = req as GetCommentsRequest;
    const { targetId } = request.params;
    const { categoryName } = request.query;
    const limit =
      request.query.limit === undefined
        ? DEFAULT_PAGINATION_OPTIONS.COMMENT.LIMIT
        : parseInt(request.query.limit);
    const page =
      request.query.page === undefined ? 1 : parseInt(request.query.page);

    const categoryId = await commentService.getCategoryId(categoryName);

    const comments = await commentService.getComments(
      parseInt(targetId),
      categoryId,
      { limit, page }
    );

    if (!comments) {
      res.status(StatusCodes.NOT_FOUND);
      return;
    }

    const sanitizedComments = commentService.sanitizeDeletedComments(comments);

    res.status(StatusCodes.OK).json(sanitizedComments);
  } catch (error) {
    next(error);
  }
}

interface AddCommentRequest extends AuthRequest {
  params: {
    targetId: string;
  };
  body: {
    content: string;
  };
  query: {
    categoryName: string;
    parentId?: string;
  };
}

export async function addComment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const request = req as AddCommentRequest;
    const { targetId } = request.params;
    const { content } = request.body;
    const { parentId } = request.query;

    const categoryId = await commentService.getCategoryId(
      request.query.categoryName
    );

    const comment = await commentService.addComment(
      parseInt(targetId),
      categoryId,
      request.user.userId,
      content,
      parentId ? parseInt(parentId) : undefined
    );

    await userService.addPointsToUser(request.user.userId, POST_COMMENT_POINTS);

    res.status(StatusCodes.CREATED).json(comment);
  } catch (error) {
    next(error);
  }
}

interface CheckCommentPermissionRequest extends AuthRequest {
  params: {
    commentId: string;
  };
}

export async function checkCommentPermission(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const request = req as CheckCommentPermissionRequest;

    const hasPermission = await commentService.checkCommentPermission(
      parseInt(request.params.commentId),
      request.user.userId
    );

    if (!hasPermission) {
      res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: "댓글 수정 권한이 없습니다." });
      return;
    }
    next();
  } catch (error) {
    next(error);
    return;
  }
}

export interface UpdateCommentRequest extends AuthRequest {
  params: {
    commentId: string;
  };
  body: {
    content: string;
  };
}

export async function updateComment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const request = req as UpdateCommentRequest;
    const { commentId } = request.params;
    const { content } = request.body;

    await commentService.updateComment(parseInt(commentId), content);
    res.status(StatusCodes.OK).json({ message: "댓글이 수정되었습니다." });
  } catch (error) {
    next(error);
  }
}

interface DeleteCommentRequest extends AuthRequest {
  params: {
    commentId: string;
  };
}

export async function deleteComment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const request = req as DeleteCommentRequest;
    const { commentId } = request.params;
    await commentService.deleteComment(parseInt(commentId));
    res.status(StatusCodes.NO_CONTENT).json({ message: "댓글이 삭제되었습니다." });
  } catch (error) {
    next(error);
  }
}
