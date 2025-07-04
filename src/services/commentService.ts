import { DELETED_USER_ID } from "../constants/user.js";
import dbDayjs from "../lib/dayjs.js";
import prisma from "../lib/prisma.js";
import { PaginationOptions } from "../types/pagination.js";
import { getPagination } from "../utils/pagination.js";

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
  pagination: PaginationOptions,
  orderBy: "createdAt" | "favoriteCount"
) {
  const { limit, page } = pagination;
  const { skip, take } = getPagination({ limit, page });

  const comments = await prisma.comment.findMany({
    where: { targetId, categoryId },
    orderBy: { [orderBy]: "desc" },
    select: {
      id: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          nickname: true,
          profileImageUrl: true,
          level: true,
          _count: {
            select: {
              answers: true,
            },
          },
        },
      },
      parentId: true,
      isDeleted: true,
      favoriteCount: true,
    },
    skip,
    take,
  });

  return comments.map((comment) => ({
    ...comment,
    user: {
      id: comment.user.id,
      nickname: comment.user.nickname,
      profileImageUrl: comment.user.profileImageUrl,
      level: comment.user.level,
      answerCount: comment.user._count.answers,
    },
  }));
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
    profileImageUrl: string | null;
    level: number;
    answerCount: number;
  };
  parentId: number | null;
  isDeleted: boolean;
  favoriteCount: number;
}

function sanitizeDeletedComments(
  comments: ResponseCommentType[]
): ResponseCommentType[] {
  return comments.map((comment) => {
    if (comment.isDeleted) {
      comment.content = "삭제된 댓글입니다.";
      comment.user = {
        id: DELETED_USER_ID,
        nickname: "",
        profileImageUrl: null,
        level: 0,
        answerCount: 0,
      };
      comment.favoriteCount = 0;
    }

    return comment;
  });
}
