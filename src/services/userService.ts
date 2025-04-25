import { FavoriteTargetType } from "@prisma/client";
import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma.js";

const userService = {
  getUserStats,
  getUserAnswerFavoriteReceived,
  getUserCommunityPostFavoriteReceived,
  getUserCommentFavoriteReceived,
  getUserAnswerCount,
  addPointsToUser,
  getLevelUpProgress,
  getFavoriteContentAuthor,
};

export const UserBasicInfoSelect: Prisma.UserSelect = {
  id: true,
  nickname: true,
  _count: {
    select: {
      answers: true,
    },
  },
};

// 유저가 받은 답변 좋아요 수
async function getUserAnswerFavoriteReceived(userId: number): Promise<number> {
  const result = await prisma.answer.aggregate({
    where: {
      userId,
    },
    _sum: {
      favoriteCount: true,
    },
  });

  return result._sum.favoriteCount ?? 0;
}

// 유저가 받은 글 좋아요 수
async function getUserCommunityPostFavoriteReceived(
  userId: number
): Promise<number> {
  const result = await prisma.communityPost.aggregate({
    where: {
      userId,
    },
    _sum: {
      favoriteCount: true,
    },
  });

  return result._sum.favoriteCount ?? 0;
}

// 유저가 받은 댓글 좋아요 수
async function getUserCommentFavoriteReceived(userId: number): Promise<number> {
  const result = await prisma.comment.aggregate({
    where: {
      userId,
    },
    _sum: {
      favoriteCount: true,
    },
  });

  return result._sum.favoriteCount ?? 0;
}

interface UserStats {
  answerCount: number; // 답변 수
  favoriteCount: number; // 받은 좋아요 합계
  communityPostCount: number; // 커뮤니티 게시글 수
  commentCount: number; // 댓글 수
  levelUpProgress: {
    currentPoints: number;
    requiredPoints: number;
    progressPercent: number;
  };
}

async function getUserAnswerCount(userId: number): Promise<number> {
  const result = await prisma.answer.count({
    where: {
      userId,
    },
  });

  return result;
}

async function getUserStats(userId: number): Promise<UserStats> {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      _count: {
        select: {
          answers: true,
          communityPosts: true,
          comments: true,
        },
      },
      level: true,
      point: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const answerCount = user._count.answers;
  const communityPostCount = user._count.communityPosts;
  const commentCount = user._count.comments;
  const favoriteCount = (
    await Promise.all([
      getUserAnswerFavoriteReceived(userId),
      getUserCommunityPostFavoriteReceived(userId),
      getUserCommentFavoriteReceived(userId),
    ])
  ).reduce((acc, curr) => acc + curr, 0);
  const levelUpProgress = getLevelUpProgress(user.point, user.level);

  return {
    answerCount,
    favoriteCount,
    communityPostCount,
    commentCount,
    levelUpProgress,
  };
}

function getLevelUpProgress(points: number, level: number) {
  const currentLevelMinPoints = calculateTotalRequiredLevelUpPoints(level);
  const nextLevelMinPoints = calculateTotalRequiredLevelUpPoints(level + 1);
  const requiredPoints = nextLevelMinPoints - currentLevelMinPoints;
  const currentProgress = points - currentLevelMinPoints;

  return {
    currentPoints: currentProgress,
    requiredPoints,
    progressPercent: Math.floor((currentProgress / requiredPoints) * 100),
  };
}

function calculateTotalRequiredLevelUpPoints(level: number): number {
  return ((level * (level + 1)) / 2) * 10;
}

async function getFavoriteContentAuthor(
  targetType: FavoriteTargetType,
  contentId: number
) {
  let userId: number | undefined;

  switch (targetType) {
    case "ANSWER": {
      const answer = await prisma.answer.findUnique({
        where: { id: contentId },
        select: { userId: true },
      });
      userId = answer?.userId;
      break;
    }
    case "COMMENT": {
      const comment = await prisma.comment.findUnique({
        where: { id: contentId },
        select: { userId: true },
      });
      userId = comment?.userId;
      break;
    }
    case "POST": {
      const post = await prisma.communityPost.findUnique({
        where: { id: contentId },
        select: { userId: true },
      });
      userId = post?.userId;
      break;
    }
  }

  return userId;
}

async function addPointsToUser(userId: number, points: number): Promise<void> {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("존재하지 않는 사용자 입니다.");
  }

  let currentLevel = user.level;
  const newTotalPoints = (user.point + points);
  let totalRequiredPoints = calculateTotalRequiredLevelUpPoints(
    currentLevel + 1
  );

  while (newTotalPoints >= totalRequiredPoints) {
    currentLevel++;
    totalRequiredPoints = calculateTotalRequiredLevelUpPoints(currentLevel + 1);
  }

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      point: newTotalPoints,
      level: currentLevel,
    },
  });
}

export default userService;
