import prisma from "../lib/prisma.js";
import { User } from "@prisma/client";

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
      answers: {
        select: {
          favoriteCount: true,
        },
      },
      communityPosts: {
        select: {
          favoriteCount: true,
        },
      },
      comments: {
        select: {
          favoriteCount: true,
        },
      },
    },
  })) as UserWithLikes[];

  const usersRankedByLikes = usersWithLikes
    .map((user) => {
      const answerLikes = user.answers.reduce(
        (sum, answer) => sum + answer.favoriteCount,
        0
      );
      const postLikes = user.communityPosts.reduce(
        (sum, post) => sum + post.favoriteCount,
        0
      );
      const commentLikes = user.comments.reduce(
        (sum, comment) => sum + comment.favoriteCount,
        0
      );
      const totalFavoriteCount = answerLikes + postLikes + commentLikes;

      return {
        id: user.id,
        nickname: user.nickname,
        totalFavoriteCount,
      };
    })
    .sort((a, b) => b.totalFavoriteCount - a.totalFavoriteCount)
    .slice(0, limit);

  return usersRankedByLikes;
}

async function getAnswerCountRankings(limit: number = 100) {
  const usersWithAnswerCount = await prisma.user.findMany({
    select: {
      id: true,
      nickname: true,
      answers: {
        select: {
          id: true, // 답변 ID 포함 (선택 사항)
        },
      },
    },
  });

  // 각 유저의 답변 수를 계산하고 내림차순으로 정렬
  const usersRankedByAnswerCount = usersWithAnswerCount
    .map((user) => ({
      id: user.id,
      nickname: user.nickname,
      answerCount: user.answers.length,
    }))
    .sort((a, b) => b.answerCount - a.answerCount)
    .slice(0, limit); // 상위 limit 개수만 추출

  return usersRankedByAnswerCount;
}

/**
 * 즐겨찾기 수를 직접 조회
 * @param targetType 즐겨찾기 대상의 타입
 * @param targetId 즐겨찾기 대상의 ID
 * @returns 즐겨찾기 수
 */
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

/**
 * 즐겨찾기 수 캐시를 업데이트
 * @param targetType 즐겨찾기 대상의 타입
 * @param targetId 즐겨찾기 대상의 ID
 */
async function updateFavoriteCount(
  targetType: FavoriteTargetType,
  targetId: number
) {
  const count = await getFavoriteCountByTargetType(targetType, targetId);

  switch (targetType) {
    case FavoriteTargetType.QUESTION:
      await prisma.question.update({
        where: { id: targetId },
        data: { favoriteCount: count },
      });
      break;
    case FavoriteTargetType.ANSWER:
      await prisma.answer.update({
        where: { id: targetId },
        data: { favoriteCount: count },
      });
      break;
    case FavoriteTargetType.COMMENT:
      await prisma.comment.update({
        where: { id: targetId },
        data: { favoriteCount: count },
      });
      break;
    case FavoriteTargetType.POST:
      await prisma.communityPost.update({
        where: { id: targetId },
        data: { favoriteCount: count },
      });
      break;
  }
}

/**
 * 즐겨찾기 수 캐시를 조회
 * @param targetType 즐겨찾기 대상의 타입
 * @param targetId 즐겨찾기 대상의 ID
 * @returns 즐겨찾기 수
 */
async function getFavoriteCount(
  targetType: FavoriteTargetType,
  targetId: number
): Promise<number> {
  switch (targetType) {
    case FavoriteTargetType.QUESTION: {
      const question = (await prisma.question.findUnique({
        where: { id: targetId },
        select: {
          favoriteCount: true,
        },
      })) as { favoriteCount: number } | null;
      if (!question) return 0;
      return question.favoriteCount;
    }
    case FavoriteTargetType.ANSWER: {
      const answer = (await prisma.answer.findUnique({
        where: { id: targetId },
        select: {
          favoriteCount: true,
        },
      })) as { favoriteCount: number } | null;
      if (!answer) return 0;
      return answer.favoriteCount;
    }
    case FavoriteTargetType.COMMENT: {
      const comment = (await prisma.comment.findUnique({
        where: { id: targetId },
        select: {
          favoriteCount: true,
        },
      })) as { favoriteCount: number } | null;
      if (!comment) return 0;
      return comment.favoriteCount;
    }
    case FavoriteTargetType.POST: {
      const post = (await prisma.communityPost.findUnique({
        where: { id: targetId },
        select: {
          favoriteCount: true,
        },
      })) as { favoriteCount: number } | null;
      if (!post) return 0;
      return post.favoriteCount;
    }
    default:
      throw new Error("Invalid target type");
  }
}

async function incrementFavoriteCount(
  targetType: FavoriteTargetType,
  targetId: number
) {
  switch (targetType) {
    case FavoriteTargetType.QUESTION:
      await prisma.question.update({
        where: { id: targetId },
        data: { favoriteCount: { increment: 1 } },
      });
      break;
    case FavoriteTargetType.ANSWER:
      await prisma.answer.update({
        where: { id: targetId },
        data: { favoriteCount: { increment: 1 } },
      });
      break;
    case FavoriteTargetType.COMMENT:
      await prisma.comment.update({
        where: { id: targetId },
        data: { favoriteCount: { increment: 1 } },
      });
      break;
    case FavoriteTargetType.POST:
      await prisma.communityPost.update({
        where: { id: targetId },
        data: { favoriteCount: { increment: 1 } },
      });
      break;
  }
}

async function decrementFavoriteCount(
  targetType: FavoriteTargetType,
  targetId: number
) {
  switch (targetType) {
    case FavoriteTargetType.QUESTION:
      await prisma.question.update({
        where: { id: targetId },
        data: { favoriteCount: { decrement: 1 } },
      });
      break;
    case FavoriteTargetType.ANSWER:
      await prisma.answer.update({
        where: { id: targetId },
        data: { favoriteCount: { decrement: 1 } },
      });
      break;
    case FavoriteTargetType.COMMENT:
      await prisma.comment.update({
        where: { id: targetId },
        data: { favoriteCount: { decrement: 1 } },
      });
      break;
    case FavoriteTargetType.POST:
      await prisma.communityPost.update({
        where: { id: targetId },
        data: { favoriteCount: { decrement: 1 } },
      });
      break;
  }
}

export default rankingService;
