import prisma from "../lib/prisma.js";

const userService = {
  getUserStats,
  getUserAnswerFavoriteReceived,
  getUserCommunityPostFavoriteReceived,
  getUserCommentFavoriteReceived,
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
  answerCount: number;
  favoriteCount: number;
  communityPostCount: number;
  commentCount: number;
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

  return {
    answerCount,
    favoriteCount,
    communityPostCount,
    commentCount,
  };
}

export default userService;
