import prisma from "../lib/prisma.js";

const rankingService = {
  getLikesCountRankings,
  getAnswerCountRankings,
};

export interface RankingUser {
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
      nickname: user.nickname,
      totalFavoriteCount: answerSum + postSum + commentSum,
      totalAnswerCount: user._count.answers,
    };
  });
}

export default rankingService;
