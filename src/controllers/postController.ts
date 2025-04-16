import { StatusCodes } from "http-status-codes";
import { Request, Response, NextFunction } from "express";
import { UserInfo } from "../services/authService";
import communityService from "../services/postService";

export async function createPost(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { title, content } = req.body as { title: string; content: string };
    const userId = (req as Request & { user: UserInfo }).user.userId;

    const newPost = await communityService.createPost(userId, title, content);

    res.status(StatusCodes.CREATED).json(newPost);
  } catch (error) {
    next(error);
  }
}

interface GetPostDetailRequest extends Request {
  params: {
    postId: string;
  };
}

export async function getPostDetail(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const request = req as GetPostDetailRequest;
    const postId = parseInt(request.params.postId);

    const postDetail = await communityService.getPostDetail(postId);

    if (!postDetail) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "Post not found" });
      return;
    }

    await communityService.increasePostViewCount(postId);

    res.status(StatusCodes.OK).json(postDetail);
  } catch (error) {
    next(error);
  }
}

export async function getPosts(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const posts = await communityService.getPosts();

    res.status(StatusCodes.OK).json(posts);
  } catch (error) {
    next(error);
  }
}

interface DeletePostRequest extends Request {
  params: {
    postId: string;
  };
}

export async function deletePost(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const request = req as DeletePostRequest;
    const postId = parseInt(request.params.postId);

    await communityService.deletePost(postId);

    res.status(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    next(error);
  }
}

export interface UpdatePostRequest extends Request {
  params: {
    postId: string;
  };

  body: {
    title: string;
    content: string;
  };
}

export async function updatePost(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const request = req as UpdatePostRequest;
    const postId = parseInt(request.params.postId);
    const { title, content } = request.body;

    const updatedPost = await communityService.updatePost(
      postId,
      title,
      content
    );

    res.status(StatusCodes.OK).json(updatedPost);
  } catch (error) {
    next(error);
  }
}
