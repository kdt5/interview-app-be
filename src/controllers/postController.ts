import { StatusCodes } from "http-status-codes";
import { Request, Response, NextFunction } from "express";
import { UserInfo } from "../services/authService.js";
import communityService from "../services/postService.js";
import postMiddleware from "../middlewares/postMiddleware.js";
import userService from "../services/userService.js";
import { POST_COMMUNITY_POST_POINTS } from "../constants/levelUpPoints.js";
import { DEFAULT_PAGINATION_OPTIONS } from "../constants/pagination.js";

export interface CreatePostRequest extends Request {
  body: {
    title: string;
    content: string;
    categoryId: number;
  };
}

export async function createPost(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const request = req as CreatePostRequest;
    const { title, content, categoryId } = request.body;
    const userId = (req as Request & { user: UserInfo }).user.userId;

    if (!(await postMiddleware.isValidPostCategory(categoryId))) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "존재하지 않는 게시글 카테고리 입니다." });
      return;
    }

    const newPost = await communityService.createPost(
      userId,
      title,
      content,
      categoryId
    );

    await userService.addPointsToUser(userId, POST_COMMUNITY_POST_POINTS);

    res.status(StatusCodes.CREATED).json(newPost);
  } catch (error) {
    next(error);
  }
}

export async function getPostCategories(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const categories = await communityService.getPostCategories();

    res.status(StatusCodes.OK).json(categories);
  } catch (error) {
    next(error);
  }
}

export function passPostOwnershipCheck(
  req: Request,
  res: Response,
) {
  res.status(StatusCodes.OK).json(true);
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
      res.status(StatusCodes.NOT_FOUND).json({ message: "존재하지 않는 게시글 입니다." });
      return;
    }

    await communityService.increasePostViewCount(postId);

    const { _count: count, ...userWithoutCount } = postDetail.user as { _count?: { answers?: number } };

    res.status(StatusCodes.OK).json({
      ...postDetail,
      user: {
        ...userWithoutCount,
        answerCount: count && typeof count.answers === "number" ? count.answers : 0,
      },
    });
  } catch (error) {
    next(error);
  }
}

interface GetPostsRequest extends Request {
  query: {
    categoryId: string;
    limit: string;
    page: string;
  };
}

export async function getPosts(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const request = req as GetPostsRequest;
    const categoryId =
      request.query.categoryId === undefined
        ? undefined
        : parseInt(request.query.categoryId);
    const limit =
      request.query.limit === undefined
        ? DEFAULT_PAGINATION_OPTIONS.POST.LIMIT
        : parseInt(request.query.limit);
    const page =
      request.query.page === undefined ? 1 : parseInt(request.query.page);

    if (categoryId && !(await postMiddleware.isValidPostCategory(categoryId))) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "존재하지 않는 게시글 카테고리 입니다." });
      return;
    }

    const posts = await communityService.getPosts(
      { limit, page },
      { postCategoryId: categoryId }
    );

    res.status(StatusCodes.OK).json(posts.map(post => {
      const { _count: count, ...userWithoutCount } = post.user as { _count?: { answers?: number } };

      return {
        ...post,
        user: {
          ...userWithoutCount,
          answerCount: count && typeof count.answers === "number" ? count.answers : 0,
        },
      }
    }));
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
