import prisma from "../lib/prisma.js";
import {
  User,
  Question,
  Answer,
  Comment,
  CommunityPost,
  Prisma,
} from "@prisma/client";

export enum FavoriteTargetType {
  QUESTION = "QUESTION",
  ANSWER = "ANSWER",
  COMMENT = "COMMENT",
  POST = "POST",
}

const rankingService = {
  getLikesCountRankings,
  getAnswerCountRankings,
  getFavoriteCountByTargetType,
  updateFavoriteCount,
  getFavoriteCount,
  incrementFavoriteCount,
  decrementFavoriteCount,
};

export interface LikesCountRankingList {
  id: number;
  nickname: string;
  totalFavoriteCount: number;
}

async function getLikesCountRankings(
  limit: number = 100
): Promise<LikesCountRankingList[]> {
  const usersWithLikes = await prisma.favorite.groupBy({
    by: ["userId"],
    _count: true,
    orderBy: {
      _count: {
        userId: "desc",
      },
    },
    take: limit,
  });

  const users = await prisma.user.findMany({
    where: {
      id: {
        in: usersWithLikes.map((fav) => fav.userId),
      },
    },
    select: {
      id: true,
      nickname: true,
    },
  });

  return usersWithLikes.map((fav) => {
    const user = users.find((u) => u.id === fav.userId);
    return {
      id: fav.userId,
      nickname: user?.nickname ?? "",
      totalFavoriteCount: fav._count,
    };
  });
}

interface UserWithAnswers extends User {
  answers: { id: number }[];
}

export interface AnswerCountRankingList {
  id: number;
  nickname: string;
  answerCount: number;
}

async function getAnswerCountRankings(
  limit: number = 100
): Promise<AnswerCountRankingList[]> {
  const usersWithAnswerCount = (await prisma.user.findMany({
    select: {
      id: true,
      nickname: true,
      answers: { select: { id: true } },
    },
    orderBy: {
      answers: {
        _count: "desc",
      },
    },
    take: limit,
  })) as UserWithAnswers[];

  return usersWithAnswerCount.map((user) => ({
    id: user.id,
    nickname: user.nickname,
    answerCount: user.answers.length,
  }));
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
