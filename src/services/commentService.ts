import dbDayjs from "../lib/dayjs";
import prisma from "../lib/prisma";

const commentService = {
  getComments,
  addComment,
  updateComment,
  deleteComment,
};

export default commentService;

async function getComments(postId: number) {
  return await prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      content: true,
      createdAt: true,
      userId: true,
      parentId: true,
      isDeleted: true,
    },
  });
}

async function addComment(
  postId: number,
  userId: number,
  content: string,
  parentId?: number
) {
  return await prisma.comment.create({
    data: {
      postId,
      userId,
      content,
      parentId,
      createdAt: dbDayjs(),
      updatedAt: dbDayjs(),
    },
  });
}

async function updateComment(commentId: number, content: string) {
  return await prisma.comment.update({
    where: { id: commentId },
    data: { content: content, updatedAt: dbDayjs() },
  });
}

async function deleteComment(commentId: number) {
  return await prisma.comment.update({
    where: { id: commentId },
    data: { isDeleted: true, updatedAt: dbDayjs() },
  });
}
