import dbDayjs from "../lib/dayjs.js";
import prisma from "../lib/prisma.js";

const communityService = {
  createPost,
  getPostDetail,
  getPosts,
  deletePost,
  updatePost,
};

export default communityService;

export async function createPost(
  userId: number,
  title: string,
  content: string
) {
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

export async function getPostDetail(postId: number) {
  return await prisma.communityPost.findUnique({
    where: { id: postId },
  });
}

export async function getPosts() {
  return await prisma.communityPost.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          nickname: true,
        },
      },
    },
  });
}

export async function deletePost(postId: number) {
  return await prisma.communityPost.delete({
    where: { id: postId },
  });
}

export async function updatePost(
  postId: number,
  title: string,
  content: string
) {
  return await prisma.communityPost.update({
    where: { id: postId },
    data: {
      title,
      content,
      updatedAt: dbDayjs(),
    },
  });
}
