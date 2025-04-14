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

interface UserWithLikes extends User {
  answers: { favoriteCount: number }[];
  communityPosts: { favoriteCount: number }[];
  comments: { favoriteCount: number }[];
}

async function getLikesCountRankings(limit: number = 100) {
  const usersWithLikes = (await prisma.user.findMany({
    select: {
      id: true,
      nickname: true,
      answers: { select: { favoriteCount: true } },
      communityPosts: { select: { favoriteCount: true } },
      comments: { select: { favoriteCount: true } },
    },
  })) as UserWithLikes[];

  const usersRankedByLikes = usersWithLikes
    .map((user) => ({
      id: user.id,
      nickname: user.nickname,
      totalFavoriteCount:
        user.answers.reduce((sum, answer) => sum + answer.favoriteCount, 0) +
        user.communityPosts.reduce((sum, post) => sum + post.favoriteCount, 0) +
        user.comments.reduce((sum, comment) => sum + comment.favoriteCount, 0),
    }))
    .sort((a, b) => b.totalFavoriteCount - a.totalFavoriteCount)
    .slice(0, limit);

  return usersRankedByLikes;
}

async function getAnswerCountRankings(limit: number = 100) {
  const usersWithAnswerCount = await prisma.user.findMany({
    select: {
      id: true,
      nickname: true,
      answers: { select: { id: true } },
    },
  });

  return usersWithAnswerCount
    .map((user) => ({
      id: user.id,
      nickname: user.nickname,
      answerCount: user.answers.length,
    }))
    .sort((a, b) => b.answerCount - a.answerCount)
    .slice(0, limit);
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
) {
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

async function incrementFavoriteCount(
  targetType: FavoriteTargetType,
  targetId: number,
  tx?: Prisma.TransactionClient
) {
  await updateEntityFavoriteCount(
    targetType,
    targetId,
    {
      favoriteCount: { increment: 1 },
    },
    tx
  );
}

async function decrementFavoriteCount(
  targetType: FavoriteTargetType,
  targetId: number,
  tx?: Prisma.TransactionClient
) {
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
) {
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
