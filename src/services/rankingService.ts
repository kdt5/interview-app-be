import prisma from "../lib/prisma.js";
import {
  Question,
  Answer,
  Comment,
  CommunityPost,
  Prisma,
} from "@prisma/client";
import { FavoriteTargetType } from "../constants/favorite.js";

const rankingService = {
  getLikesCountRankings,
  getAnswerCountRankings,
  getFavoriteCountByTargetType,
  updateFavoriteCount,
  getFavoriteCount,
  incrementFavoriteCount,
  decrementFavoriteCount,
};

export interface RankingUser {
  userId: number;
  nickname: string;
  totalFavoriteCount: number;
  totalAnswerCount: number;
}

async function getLikesCountRankings(
  limit: number = 100
): Promise<RankingUser[]> {
  // 각 타입별로 좋아요 수가 많은 사용자 ID 조회
  const [answerFavorites, postFavorites, commentFavorites] = await Promise.all([
    prisma.answer.groupBy({
      by: ["userId"],
      _sum: {
        favoriteCount: true,
      },
      orderBy: {
        _sum: {
          favoriteCount: "desc",
        },
      },
      take: limit,
    }),
    prisma.communityPost.groupBy({
      by: ["userId"],
      _sum: {
        favoriteCount: true,
      },
      orderBy: {
        _sum: {
          favoriteCount: "desc",
        },
      },
      take: limit,
    }),
    prisma.comment.groupBy({
      by: ["userId"],
      _sum: {
        favoriteCount: true,
      },
      orderBy: {
        _sum: {
          favoriteCount: "desc",
        },
      },
      take: limit,
    }),
  ]);

  // 모든 사용자 ID 수집
  const userIds = new Set([
    ...answerFavorites.map((f) => f.userId),
    ...postFavorites.map((f) => f.userId),
    ...commentFavorites.map((f) => f.userId),
  ]);

  // 사용자 정보 조회
  const users = await prisma.user.findMany({
    where: {
      id: {
        in: Array.from(userIds),
      },
    },
    select: {
      id: true,
      nickname: true,
      answers: {
        select: {
          id: true,
        },
      },
    },
  });

  // 사용자별 좋아요 수 계산
  const userFavorites = users.map((user) => {
    const answerSum =
      answerFavorites.find((f) => f.userId === user.id)?._sum.favoriteCount ??
      0;
    const postSum =
      postFavorites.find((f) => f.userId === user.id)?._sum.favoriteCount ?? 0;
    const commentSum =
      commentFavorites.find((f) => f.userId === user.id)?._sum.favoriteCount ??
      0;

    return {
      userId: user.id,
      nickname: user.nickname,
      totalFavoriteCount: answerSum + postSum + commentSum,
      totalAnswerCount: user.answers.length,
    };
  });

  return userFavorites
    .sort((a, b) => b.totalFavoriteCount - a.totalFavoriteCount)
    .slice(0, limit);
}

async function getAnswerCountRankings(
  limit: number = 100
): Promise<RankingUser[]> {
  // 답변 수가 많은 사용자 조회
  const usersWithAnswers = await prisma.user.findMany({
    select: {
      id: true,
      nickname: true,
      _count: {
        select: {
          answers: true,
        },
      },
    },
    orderBy: {
      answers: {
        _count: "desc",
      },
    },
    take: limit,
  });

  // 사용자별 좋아요 수 계산
  const [answerFavorites, postFavorites, commentFavorites] = await Promise.all([
    prisma.answer.groupBy({
      by: ["userId"],
      where: {
        userId: {
          in: usersWithAnswers.map((u) => u.id),
        },
      },
      _sum: {
        favoriteCount: true,
      },
    }),
    prisma.communityPost.groupBy({
      by: ["userId"],
      where: {
        userId: {
          in: usersWithAnswers.map((u) => u.id),
        },
      },
      _sum: {
        favoriteCount: true,
      },
    }),
    prisma.comment.groupBy({
      by: ["userId"],
      where: {
        userId: {
          in: usersWithAnswers.map((u) => u.id),
        },
      },
      _sum: {
        favoriteCount: true,
      },
    }),
  ]);

  return usersWithAnswers.map((user) => {
    const answerSum =
      answerFavorites.find((f) => f.userId === user.id)?._sum.favoriteCount ??
      0;
    const postSum =
      postFavorites.find((f) => f.userId === user.id)?._sum.favoriteCount ?? 0;
    const commentSum =
      commentFavorites.find((f) => f.userId === user.id)?._sum.favoriteCount ??
      0;

    return {
      userId: user.id,
      nickname: user.nickname,
      totalFavoriteCount: answerSum + postSum + commentSum,
      totalAnswerCount: user._count.answers,
    };
  });
}

async function getFavoriteCountByTargetType(
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

async function updateFavoriteCount(
  targetType: FavoriteTargetType,
  targetId: number
): Promise<void> {
  const count = await getFavoriteCountByTargetType(targetType, targetId);
  await updateEntityFavoriteCount(targetType, targetId, {
    favoriteCount: count,
  });
}

async function getFavoriteCount(
  targetType: FavoriteTargetType,
  targetId: number
): Promise<number> {
  const result = await findUniqueEntity(targetType, targetId, {
    select: { favoriteCount: true },
  });
  return result?.favoriteCount ?? 0;
}

// 좋아요 증가 캐시
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

// 좋아요 감소 캐시
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
    case FavoriteTargetType.QUESTION:
      await prismaClient.question.update({ where: { id: targetId }, data });
      break;
    case FavoriteTargetType.ANSWER:
      await prismaClient.answer.update({ where: { id: targetId }, data });
      break;
    case FavoriteTargetType.COMMENT:
      await prismaClient.comment.update({ where: { id: targetId }, data });
      break;
    case FavoriteTargetType.POST:
      await prismaClient.communityPost.update({
        where: { id: targetId },
        data,
      });
      break;
    default:
      throw new Error("Invalid target type");
  }
}

async function findUniqueEntity<
  T extends Question | Answer | Comment | CommunityPost
>(
  targetType: FavoriteTargetType,
  targetId: number,
  select: { select: { favoriteCount: true } }
): Promise<(T & { favoriteCount: number }) | null> {
  switch (targetType) {
    case FavoriteTargetType.QUESTION:
      return prisma.question.findUnique({
        where: { id: targetId },
        ...select,
      }) as Promise<(T & { favoriteCount: number }) | null>;
    case FavoriteTargetType.ANSWER:
      return prisma.answer.findUnique({
        where: { id: targetId },
        ...select,
      }) as Promise<(T & { favoriteCount: number }) | null>;
    case FavoriteTargetType.COMMENT:
      return prisma.comment.findUnique({
        where: { id: targetId },
        ...select,
      }) as Promise<(T & { favoriteCount: number }) | null>;
    case FavoriteTargetType.POST:
      return prisma.communityPost.findUnique({
        where: { id: targetId },
        ...select,
      }) as Promise<(T & { favoriteCount: number }) | null>;
    default:
      throw new Error("Invalid target type");
  }
}

export default rankingService;
