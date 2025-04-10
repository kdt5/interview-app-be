/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import dbDayjs from "../lib/dayjs.js";
import prisma from "../lib/prisma.js";
import { Favorite, FavoriteTargetType } from "@prisma/client";

export async function getFavorites(userId: number, targetType: FavoriteTargetType) {
  const favoriteTargetIds: {targetId: number}[] = await prisma.favorite.findMany({
    where: {
      userId,
      targetType,
    },
    select: {
      targetId: true,
    }
  });

  const targetIds = favoriteTargetIds.map((favorite) => favorite.targetId);

  if(targetIds.length === 0) {
    return [];
  }

  if (targetType === "QUESTION") {
    return await prisma.question.findMany({
      where: {
        id: {
          in: targetIds,
        },
      },
      select: {
        id: true,
        title: true,
        content: true,
        favoriteCount: true,
      }
    });
  }

  if (targetType === "POST") {
    return await prisma.communityPost.findMany({
      where: {
        id: {
          in: targetIds,
        },
      },
      select: {
        id: true,
        title: true,
        content: true,
        favoriteCount: true,
        user: {
          select: {
            id: true,
            nickname: true,
          }
        }
      }
    });
  }

  if (targetType === "ANSWER") {
    return await prisma.answer.findMany({
      where: {
        id: {
          in: targetIds,
        },
      },
      select: {
        id: true,
        content: true,
        favoriteCount: true,
        question: {
          select: {
            id: true,
            title: true,
          }
        },
        user: {
          select: {
            id: true,
            nickname: true,
          }
        }
      }
    });
  }

  if (targetType === "COMMENT") {
    return await prisma.comment.findMany({
      where: {
        id: {
          in: targetIds,
        },
      },
      select: {
        id: true,
        content: true,
        favoriteCount: true,
        user: {
          select: {
            id: true,
            nickname: true,
          }
        }
      }
    });
  }

}

export async function getFavoriteStatus(
  userId: number,
  targetType: FavoriteTargetType,
  targetId: number
) {
  return await prisma.favorite.findUniqueOrThrow({
    where: {
      targetType_targetId_userId: {
        targetType,
        targetId,
        userId,
      }
    },
  });
}

export async function createFavorite(
  userId: number,
  targetType: FavoriteTargetType,
  targetId: number
): Promise<Favorite> {
  return await prisma.favorite.create({
    data: {
      userId,
      targetType,
      targetId,
      createdAt: dbDayjs(),
    }
  });
}

export async function removeFavorite(
  userId: number,
  targetType: FavoriteTargetType,
  targetId: number
): Promise<Favorite> {
  return await prisma.favorite.delete({
    where: {
      targetType_targetId_userId: {
        targetType,
        targetId,
        userId,
      }
    }
  })
}

export const favoriteService = {
  getFavorites,
  getFavoriteStatus,
  createFavorite,
  removeFavorite,
};
