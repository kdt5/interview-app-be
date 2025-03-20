import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library.js";
import dbDayjs from "../lib/dayjs.js";
import prisma from "../lib/prisma.js";
import { Favorite } from "@prisma/client";

export async function getFavoriteQuestions(userId: number) {
  return await prisma.favorite.findMany({
    where: { userId: userId },
    select: {
      userId: true,
      question: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });
}

export async function getFavoriteQuestionStatus(
  userId: number,
  questionId: number
) {
  return await prisma.favorite.findUniqueOrThrow({
    where: {
      userId_questionId: {
        userId,
        questionId,
      },
    },
  });
}

export async function createFavorite(
  userId: number,
  questionId: number
): Promise<Favorite> {
  try {
    await prisma.favorite.findUniqueOrThrow({
      where: { userId_questionId: { userId, questionId } },
    });

    throw new Error("이미 즐겨찾기에 추가된 질문입니다.");
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return prisma.favorite.create({
        data: {
          userId: userId,
          questionId: questionId,
          createdAt: dbDayjs(),
        },
      });
    }

    throw error;
  }
}

export async function removeFavorite(
  userId: number,
  questionId: number
): Promise<void> {
  try {
    const existingFavorite = await prisma.favorite.findUniqueOrThrow({
      where: { userId_questionId: { userId, questionId } },
    });

    await prisma.favorite.delete({
      where: {
        id: existingFavorite.id,
      },
    });
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new Error("즐겨찾기가 존재하지 않습니다.");
    }

    throw error;
  }
}

export const favoriteService = {
  createFavorite,
  removeFavorite,
};
