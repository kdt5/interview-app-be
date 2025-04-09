import prisma from "../lib/prisma.js";

const rankingService = {
  getRankings,
  getMyRankings,
  getLikesRankings,
  getAnswersRankings,
};

export async function getRankings(limit: number = 100) {
  return await prisma.user.findMany({
    take: limit,
    orderBy: {
      answers: {
        _count: "desc",
      },
    },
    select: {
      id: true,
      nickname: true,
      _count: {
        select: {
          answers: true,
        },
      },
    },
  });
}

export async function getMyRankings(userId: number) {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      nickname: true,
      _count: {
        select: {
          answers: true,
        },
      },
    },
  });
}

export async function getLikesRankings(limit: number = 100) {
  return await prisma.user.findMany({
    take: limit,
    orderBy: {
      answers: {
        _count: "desc",
      },
    },
    select: {
      id: true,
      nickname: true,
      _count: {
        select: {
          answers: true,
        },
      },
    },
  });
}

export async function getAnswersRankings(limit: number = 100) {
  return await prisma.user.findMany({
    take: limit,
    orderBy: {
      answers: {
        _count: "desc",
      },
    },
    select: {
      id: true,
      nickname: true,
      _count: {
        select: {
          answers: true,
        },
      },
    },
  });
}

export default rankingService;
