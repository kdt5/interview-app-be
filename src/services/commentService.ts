import dbDayjs from "../lib/dayjs";
import prisma from "../lib/prisma";

const commentService = {
  checkCommentPermission,
  getComments,
  addComment,
  updateComment,
  deleteComment,
  getCategoryId,
};

export default commentService;

export enum CommentCategory {
  POST = "post",
  ANSWER = "answer",
}

async function checkCommentPermission(
  commentId: number,
  userId: number
): Promise<boolean> {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId, userId: userId },
    select: { id: true },
  });

  return comment !== null;
}

async function getComments(targetId: number, categoryId: number) {
  return await prisma.comment.findMany({
    where: { targetId, categoryId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      content: true,
      createdAt: true,
      userId: true,
      parentId: true,
      isDeleted: true,
      categoryId: true,
    },
  });
}

async function addComment(
  targetId: number,
  categoryId: number,
  userId: number,
  content: string,
  parentId?: number
) {
  return await prisma.comment.create({
    data: {
      targetId,
      categoryId,
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
    data: { isDeleted: true, updatedAt: dbDayjs(), deletedAt: dbDayjs() },
  });
}

async function getCategoryId(categoryName: string) {
  const category = await prisma.commentCategory.findUnique({
    where: { name: categoryName },
    select: { id: true },
  });

  if (category === null) {
    throw new Error("Comment category not found");
  }

  return category?.id;
}
