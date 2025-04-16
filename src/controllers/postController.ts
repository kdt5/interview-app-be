import { StatusCodes } from "http-status-codes";
import { Request, Response, NextFunction } from "express";
import { UserInfo } from "../services/authService";
import communityService from "../services/postService";
import { isValidPostCategory } from "../middlewares/postMiddleware";

export async function createPost(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { title, content, categoryId } = req.body as { title: string; content: string; categoryId: number };
    const userId = (req as Request & { user: UserInfo }).user.userId;

    if(!(await isValidPostCategory(categoryId))) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: "존재하지 않는 게시글 카테고리 입니다." });
      return;
    }

    const newPost = await communityService.createPost(userId, title, content, categoryId);

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
    const { categoryId } = req.query as { categoryId: string };

    if (categoryId && !(await isValidPostCategory(parseInt(categoryId)))) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: "존재하지 않는 게시글 카테고리 입니다." });
      return;
    }

    const posts = await communityService.getPosts(categoryId ? parseInt(categoryId) : undefined);

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
    categoryId: string;
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
    const { title, content, categoryId } = request.body;

    const updatedPost = await communityService.updatePost(
      postId,
      title,
      content,
      parseInt(categoryId)
    );

    res.status(StatusCodes.OK).json(updatedPost);
  } catch (error) {
    next(error);
  }
}
