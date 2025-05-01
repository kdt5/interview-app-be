import dbDayjs from "../lib/dayjs.js";
import prisma from "../lib/prisma.js";
import { Favorite, FavoriteTargetType } from "@prisma/client";
import { Prisma } from "@prisma/client";

export const favoriteService = {
  getFavorites,
  getFavoriteStatus,
  createFavorite,
  removeFavorite,
  updateFavoriteCount,
  incrementFavoriteCount,
  decrementFavoriteCount,
  getFavoriteStatuses,
};

async function getFavorites(userId: number, targetType: FavoriteTargetType) {
  const favoriteTargetIds: { targetId: number }[] =
    await prisma.favorite.findMany({
      where: {
        userId,
        targetType,
      },
      select: {
        targetId: true,
      },
    });

  const targetIds = favoriteTargetIds.map((favorite) => favorite.targetId);

  if (targetIds.length === 0) {
    return [];
  }

  if (targetType === "QUESTION") {
    const questions = await prisma.question.findMany({
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
        _count: {
          select: {
            answers: true,
          }
        },
        weeklyQuestion: {
          select: {
            questionId: true,
          }
        }
      },
    });

    return questions.map((q) => ({
      id: q.id,
      title: q.title,
      content: q.content,
      favoriteCount: q.favoriteCount,
      answerCount: q._count.answers,
      isWeekly: q.weeklyQuestion !== null,
    }));
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
        viewCount: true,
        user: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
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
          },
        },
        user: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
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
          },
        },
      },
    });
  }
}

async function getFavoriteStatus(
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
      },
    },
  });
}

async function getFavoriteStatuses(
  userId: number,
  targetType: FavoriteTargetType,
  targetIds: number[]
): Promise<boolean[]> {
  const favorites = await prisma.favorite.findMany({
    where: {
      userId,
      targetType: targetType,
      targetId: {
        in: targetIds,
      },
    },
    select: {
      targetId: true,
    },
  });

  const favoriteIds = favorites.map((favorite) => favorite.targetId);

  return targetIds.map((questionId) => favoriteIds.includes(questionId));
}

async function createFavorite(
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
    },
  });
}

async function removeFavorite(
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
      },
    },
  });
}

async function getFavoriteCount(
  targetType: FavoriteTargetType,
  targetId: number
): Promise<number> {
  const count = await prisma.favorite.count({
    where: {
      targetType,
      targetId,
    },
  });
  return count;
}

// 좋아요 캐시 업데이트
async function updateFavoriteCount(
  targetType: FavoriteTargetType,
  targetId: number
): Promise<void> {
  const count = await getFavoriteCount(targetType, targetId);
  await updateEntityFavoriteCount(targetType, targetId, {
    favoriteCount: count,
  });
}

async function updateEntityFavoriteCount(
  targetType: FavoriteTargetType,
  targetId: number,
  data: {
    favoriteCount: number | { increment: number } | { decrement: number };
  },
  tx?: Prisma.TransactionClient
): Promise<void> {
  const prismaClient = tx || prisma;
  switch (targetType) {
    case "QUESTION":
      await prismaClient.question.update({ where: { id: targetId }, data });
      break;
    case "ANSWER":
      await prismaClient.answer.update({ where: { id: targetId }, data });
      break;
    case "COMMENT":
      await prismaClient.comment.update({ where: { id: targetId }, data });
      break;
    case "POST":
      await prismaClient.communityPost.update({
        where: { id: targetId },
        data,
      });
      break;
    default:
      throw new Error("Invalid target type");
  }
}

// 좋아요 증가 (캐시)
async function incrementFavoriteCount(
  targetType: FavoriteTargetType,
  targetId: number,
  tx?: Prisma.TransactionClient
): Promise<void> {
  await updateEntityFavoriteCount(
    targetType,
    targetId,
    {
      favoriteCount: { increment: 1 },
    },
    tx
  );
}

// 좋아요 감소 (캐시)
async function decrementFavoriteCount(
  targetType: FavoriteTargetType,
  targetId: number,
  tx?: Prisma.TransactionClient
): Promise<void> {
  await updateEntityFavoriteCount(
    targetType,
    targetId,
    {
      favoriteCount: { decrement: 1 },
    },
    tx
  );
}

export default favoriteService;
