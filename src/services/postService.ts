import { Prisma } from "@prisma/client";
import dbDayjs from "../lib/dayjs.js";
import prisma from "../lib/prisma.js";

const communityService = {
  createPost,
  getPostDetail,
  getPosts,
  deletePost,
  updatePost,
  increasePostViewCount,
};

export default communityService;

async function createPost(userId: number, title: string, content: string) {
  return await prisma.communityPost.create({
    data: {
      userId,
      title,
      content,
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
    select: PostSelect,
    where: { id: postId },
  });
}

async function getPosts() {
  return await prisma.communityPost.findMany({
    select: PostSelect,
    orderBy: { createdAt: "desc" },
  });
}

async function deletePost(postId: number) {
  return await prisma.communityPost.delete({
    where: { id: postId },
  });
}

async function updatePost(postId: number, title: string, content: string) {
  return await prisma.communityPost.update({
    where: { id: postId },
    data: {
      title,
      content,
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
