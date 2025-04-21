import prisma from "../lib/prisma.js";
import dbDayjs from "../lib/dayjs.js";
import { CommunityPost, FavoriteTargetType } from "@prisma/client";

const trendingService = {
  getTrendingPosts,
};

// 최근 7일 동안의 즐겨찾기 수와 댓글 수가 높고, 조회수가 높은 게시글을 추천
// TODO: 조회 시간을 저장하면 최근 조회에 가중치를 줄 수 있음
const startDate = dbDayjs({ days: -7 });
const endDate = dbDayjs();

async function getTrendingPosts(
  limit: number = 10,
  categoryId?: number
): Promise<CommunityPost[]> {
  // 최근 일주일 동안의 즐겨찾기 수 집계
  const recentFavorites = await prisma.favorite.groupBy({
    by: ["targetId"],
    where: {
      targetType: FavoriteTargetType.POST,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _count: {
      targetId: true,
    },
  });

  // 최근 일주일 동안의 댓글 수 집계
  const recentComments = await prisma.comment.groupBy({
    by: ["targetId"],
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _count: {
      targetId: true,
    },
  });

  // 즐겨찾기와 댓글 수를 합산하여 정렬
  const postScores = new Map<number, number>();

  recentFavorites.forEach((fav) => {
    postScores.set(
      fav.targetId,
      (postScores.get(fav.targetId) || 0) + fav._count.targetId
    );
  });

  recentComments.forEach((comment) => {
    postScores.set(
      comment.targetId,
      (postScores.get(comment.targetId) || 0) + comment._count.targetId
    );
  });

  // 점수가 높은 순서대로 postId 정렬
  const sortedPostIds = Array.from(postScores.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([postId]) => postId);

  // 정렬된 순서대로 게시글 조회
  const trendingPosts = await prisma.communityPost.findMany({
    where: {
      id: {
        in: sortedPostIds,
      },
      postCategoryId: categoryId ? categoryId : undefined,
    },
  });

  // 정렬된 순서대로 반환
  const result = sortedPostIds.map(
    (postId) => trendingPosts.find((post) => post.id === postId)!
  );

  // limit보다 적으면 조회수 순으로 추가 게시글 조회
  if (result.length < limit) {
    const additionalPosts = await prisma.communityPost.findMany({
      where: {
        id: {
          notIn: sortedPostIds,
        },
        postCategoryId: categoryId ? categoryId : undefined,
      },
      orderBy: {
        viewCount: "desc",
      },
      take: limit - result.length,
    });

    result.push(...additionalPosts);
  }

  return result;
}

export default trendingService;
