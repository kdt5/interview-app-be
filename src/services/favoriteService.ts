import prisma from "../lib/prisma.js";
import { Favorite } from "@prisma/client";

export const createFavorite = async (
  userId: number,
  questionId: number
): Promise<Favorite> => {
  const existingFavorite = await prisma.favorite.findFirst({
    where: {
      userId: userId,
      questionId: questionId,
    },
  });

  if (existingFavorite) {
    throw new Error("FAVORITE_DUPLICATE");
  }

  const addFavorite = await prisma.favorite.create({
    data: {
      userId: userId,
      questionId: questionId,
    },
  });

  return addFavorite;
};

export const removeFavorite = async (
  userId: number,
  questionId: number
): Promise<void> => {
  const existingFavorite = await prisma.favorite.findFirst({
    where: {
      userId: userId,
      questionId: questionId,
    },
  });

  if (!existingFavorite) {
    throw new Error("FAVORITE_NOT_FOUND");
  }

  await prisma.favorite.delete({
    where: {
      id: existingFavorite.id,
    },
  });
};
