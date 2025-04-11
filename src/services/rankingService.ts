import prisma from "../lib/prisma.js";

const rankingService = {
  getLikesRankings,
  getAnswersRankings,
};

export async function getLikesRankings(limit: number = 100) {
  return await prisma.user.findMany({
    take: limit,
    orderBy: {
      answerLikes: {
        _count: "desc",
      },
    },
    select: {
      id: true,
      nickname: true,
      _count: {
        select: {
          answerLikes: true,
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
