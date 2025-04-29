import { Prisma } from "@prisma/client";
import dbDayjs from "../lib/dayjs.js";
import prisma from "../lib/prisma.js";
import { PaginationOptions } from "../types/pagination.js";
import { getPagination } from "../utils/pagination.js";

const communityService = {
  createPost,
  getPostDetail,
  getPosts,
  deletePost,
  updatePost,
  increasePostViewCount,
  getPostCategories,
};

export default communityService;

async function createPost(
  userId: number,
  title: string,
  content: string,
  postCategoryId: number
) {
  return await prisma.communityPost.create({
    data: {
      userId,
      title,
      content,
      postCategoryId,
      createdAt: dbDayjs(),
      updatedAt: dbDayjs(),
    },
  });
}

async function getPostCategories() {
  return await prisma.communityPostCategory.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: { id: "asc" },
  });
}

const PostSelect: Prisma.CommunityPostSelect = {
  id: true,
  title: true,
  content: true,
  postCategoryId: true,
  user: {
    select: {
      id: true,
      nickname: true,
      profileImageUrl: true,
      level: true,
      _count: {
        select: {
          answers: true,
        }
      }
    },
  },
  createdAt: true,
  updatedAt: true,
  viewCount: true,
  favoriteCount: true,
};

async function getPostDetail(postId: number) {
  return await prisma.communityPost.findUnique({
    where: { id: postId },
    select: PostSelect,
  });
}

async function getPosts(
  pagination: PaginationOptions,
  options?: {
    postCategoryId?: number;
  }
) {
  const { limit, page } = pagination;
  const { skip, take } = getPagination({ limit, page });
  const { postCategoryId } = options ?? {};

  return await prisma.communityPost.findMany({
    where: postCategoryId ? { postCategoryId } : undefined,
    select: PostSelect,
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });
}

async function deletePost(postId: number) {
  return await prisma.communityPost.delete({
    where: { id: postId },
  });
}

async function updatePost(
  postId: number,
  title: string,
  content: string,
  postCategoryId: number
) {
  return await prisma.communityPost.update({
    where: { id: postId },
    data: {
      title,
      content,
      postCategoryId,
      updatedAt: dbDayjs(),
    },
  });
}

async function increasePostViewCount(postId: number) {
  return await prisma.communityPost.update({
    where: { id: postId },
    data: {
      viewCount: { increment: 1 },
    },
  });
}
