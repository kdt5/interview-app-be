import { DEFAULT_PAGINATION_OPTIONS } from "../constants/pagination.js";
import { DELETED_USER_ID } from "../constants/user.js";
import dbDayjs from "../lib/dayjs.js";
import prisma from "../lib/prisma.js";

const commentService = {
  checkCommentPermission,
  getComments,
  addComment,
  updateComment,
  deleteComment,
  getCategoryId,
  sanitizeDeletedComments,
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

async function getComments(
  targetId: number,
  categoryId: number,
  pageSize: number = DEFAULT_PAGINATION_OPTIONS.COMMENT.PAGE_SIZE,
  page: number = 1
) {
  return await prisma.comment.findMany({
    where: { targetId, categoryId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          nickname: true,
        },
      },
      parentId: true,
      isDeleted: true,
      favoriteCount: true,
    },
    skip: pageSize * (page - 1),
    take: pageSize,
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
      content,
      createdAt: dbDayjs(),
      updatedAt: dbDayjs(),
      userId,
      categoryId,
      targetId,
      parentId,
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

interface ResponseCommentType {
  id: number;
  content: string;
  createdAt: Date;
  user: {
    id: number;
    nickname: string;
  };
  parentId: number | null;
  isDeleted: boolean;
  favoriteCount: number;
}

function sanitizeDeletedComments(
  comments: ResponseCommentType[]
): ResponseCommentType[] {
  return { ...comments }.map((comment) => {
    if (comment.isDeleted) {
      comment.content = "";
      comment.user = {
        id: DELETED_USER_ID,
        nickname: "",
      };
      comment.favoriteCount = 0;
    }

    return comment;
  });
}
