import dbDayjs from "../lib/dayjs.js";
import prisma from "../lib/prisma.js";
import { Favorite } from "@prisma/client";

export async function getFavoriteQuestions(userId: number) {
  const favoriteQuestionIds: {targetId: number}[] = await prisma.favorite.findMany({
    where: {
      userId,
      targetType: "QUESTION",
    },
    select: {
      targetId: true,
    }
  });

  const questionIds = favoriteQuestionIds.map((favorite) => favorite.targetId);

  if(questionIds.length === 0) {
    return [];
  }

  return await prisma.question.findMany({
    where: {
      id: {
        in: questionIds,
      },
    },
    select: {
      id: true,
      title: true,
    }
  });
}

export async function getFavoriteQuestionStatus(
  userId: number,
  questionId: number
) {
  return await prisma.favorite.findUniqueOrThrow({
    where: {
      targetType_targetId_userId: {
        targetType: "QUESTION",
        targetId: questionId,
        userId,
      }
    },
  });
}

export async function createFavorite(
  userId: number,
  questionId: number
): Promise<Favorite> {
  return await prisma.favorite.create({
    data: {
      userId,
      targetType: "QUESTION",
      targetId: questionId,
      createdAt: dbDayjs(),
    }
  });
}

export async function removeFavorite(
  userId: number,
  questionId: number
): Promise<Favorite> {
  return await prisma.favorite.delete({
    where: {
      targetType_targetId_userId: {
        targetType: "QUESTION",
        targetId: questionId,
        userId,
      }
    }
  })
}

export const favoriteService = {
  getFavoriteQuestions,
  getFavoriteQuestionStatus,
  createFavorite,
  removeFavorite,
};
