import prisma from "../lib/prisma.js";
import dbDayjs from "../lib/dayjs.js";
import { FavoriteTargetType } from "../constants/favorite.js";
import { Question, CommunityPost } from "@prisma/client";

const trendingService = {
  getTrendingQuestions,
  getTrendingPosts,
};

export default trendingService;

// TODO: 조회 시간을 저장하여 트렌드 반영
const startDate = dbDayjs({ days: -7 });
const endDate = dbDayjs();

async function getTrendingQuestions(
  limit: number = 10,
  categoryId?: number
): Promise<Question[]> {
  // 최근 즐겨찾기 수가 많은 질문 조회
  const trendingQuestionIds = await getTrendingByFavorite(
    FavoriteTargetType.QUESTION,
    startDate,
    endDate
  );

  // 최근 댓글 수가 많은 질문 조회

  const trendingQuestions = await prisma.question.findMany({
    where: {
      id: { in: trendingQuestionIds.map((question) => question.targetId) },
      categories: categoryId
        ? {
            some: {
              category: { id: categoryId },
            },
          }
        : undefined,
    },
    take: limit,
  });

  return trendingQuestions;
}

async function getTrendingPosts(
  limit: number = 10,
  categoryId?: number
): Promise<CommunityPost[]> {
  // 최근 즐겨찾기 수가 많은 게시글 조회
  const trendingPostIds = await getTrendingByFavorite(
    FavoriteTargetType.POST,
    startDate,
    endDate
  );

  const trendingPosts = await prisma.communityPost.findMany({
    where: {
      id: { in: trendingPostIds.map((post) => post.targetId) },
      postCategoryId: categoryId ? categoryId : undefined,
    },
    take: limit,
  });

  return trendingPosts;
}

async function getTrendingByFavorite(
  targetType: FavoriteTargetType,
  startDate: Date,
  endDate: Date
) {
  return await prisma.favorite.groupBy({
    by: ["targetId"],
    where: {
      targetType,
      createdAt: { gte: startDate, lte: endDate },
    },
    _count: {
      targetId: true,
    },
    orderBy: {
      _count: {
        targetId: "desc",
      },
    },
  });
}

async function getTrendingByComment(
  targetType: FavoriteTargetType,
  startDate: Date,
  endDate: Date
) {
  return await prisma.comment.groupBy({
    by: ["targetId"],
    where: {
      targetType,
      createdAt: { gte: startDate, lte: endDate },
    },
  });
}
