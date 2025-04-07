import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import commentService from "../services/commentService";
import { AuthRequest } from "../middlewares/authMiddleware";
import { DELETED_USER_ID } from "../constants/user";

interface GetCommentsRequest extends Request {
  params: {
    postId: string;
  };
}

export async function getComments(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const request = req as GetCommentsRequest;
    const { postId } = request.params;

    const comments = await commentService.getComments(parseInt(postId));

    if (!comments) {
      res.status(StatusCodes.NOT_FOUND);
      return;
    }

    comments.map((comment) => {
      if (comment.isDeleted) {
        comment.userId = DELETED_USER_ID;
        comment.content = "삭제된 댓글입니다.";
      }
    });

    res.status(StatusCodes.OK).json(comments);
  } catch (error) {
    next(error);
  }
}

interface AddCommentRequest extends AuthRequest {
  params: {
    postId: string;
  };
  body: {
    content: string;
  };
  query: {
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
    const { postId } = request.params;
    const { content } = request.body;
    const { parentId } = request.query;

    if (!content) {
      res.status(StatusCodes.BAD_REQUEST);
      return;
    }

    const comment = await commentService.addComment(
      parseInt(postId),
      request.user.userId,
      content,
      parentId ? parseInt(parentId) : undefined
    );

    if (comment === null) {
      res.status(StatusCodes.NOT_FOUND);
      return;
    }

    res.status(StatusCodes.CREATED).json(comment);
  } catch (error) {
    next(error);
  }
}

interface UpdateCommentRequest extends Request {
  params: {
    postId: string;
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
    const { postId } = request.params;
    const { content } = request.body;

    const updatedComment = await commentService.updateComment(
      parseInt(postId),
      content
    );

    if (updatedComment === null) {
      res.status(StatusCodes.NOT_FOUND);
      return;
    }
  } catch (error) {
    next(error);
  }
}

interface DeleteCommentRequest extends Request {
  params: {
    postId: string;
  };
}

export async function deleteComment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const request = req as DeleteCommentRequest;
    const { postId } = request.params;
    const result = await commentService.deleteComment(parseInt(postId));

    if (result === null) {
      res.status(StatusCodes.NOT_FOUND);
      return;
    }
  } catch (error) {
    next(error);
  }
}
