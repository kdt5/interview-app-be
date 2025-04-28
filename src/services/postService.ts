import { Prisma } from "@prisma/client";
import dbDayjs from "../lib/dayjs.js";
import prisma from "../lib/prisma.js";
import { DEFAULT_PAGINATION_OPTIONS } from "../constants/pagination.js";

const communityService = {
  createPost,
  getPostDetail,
  getPosts,
  deletePost,
  updatePost,
  increasePostViewCount,
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

const PostSelect: Prisma.CommunityPostSelect = {
  id: true,
  title: true,
  content: true,
  user: {
    select: {
      id: true,
      nickname: true,
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
  postCategoryId?: number,
  limit: number = DEFAULT_PAGINATION_OPTIONS.POST.LIMIT,
  page: number = 1
) {
  return await prisma.communityPost.findMany({
    where: postCategoryId ? { postCategoryId } : undefined,
    select: PostSelect,
    orderBy: { createdAt: "desc" },
    skip: limit * (page - 1),
    take: limit,
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
