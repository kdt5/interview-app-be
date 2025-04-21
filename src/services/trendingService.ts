import prisma from "../lib/prisma.js";
import dbDayjs from "../lib/dayjs.js";
import { CommunityPost, FavoriteTargetType, Prisma } from "@prisma/client";

const trendingService = {
  getTrendingPosts,
};

// 최근 7일 동안의 즐겨찾기 수와 댓글 수가 높고, 조회수가 높은 게시글을 추천
// TODO: 조회 시간을 저장하면 최근 조회에 가중치를 줄 수 있음
const startDate = dbDayjs({ days: -7 });
const endDate = dbDayjs();

// 가중치 상수
const FAVORITE_WEIGHT = 2; // 즐겨찾기 가중치
const COMMENT_WEIGHT = 1; // 댓글 가중치
const VIEW_WEIGHT = 0.3; // 조회수 가중치

async function getTrendingPosts(
  limit: number = 10,
  categoryId?: number
): Promise<CommunityPost[]> {
  // 최근 일주일 동안의 활동 점수 계산
  const recentActivities = await prisma.$queryRaw<
    { postId: number; score: number }[]
  >`
    WITH recent_favorites AS (
      SELECT 
        targetId as postId,
        COUNT(*) * ${FAVORITE_WEIGHT} as favorite_score
      FROM Favorite
      WHERE targetType = ${FavoriteTargetType.POST}
        AND createdAt >= ${startDate}
        AND createdAt <= ${endDate}
      GROUP BY targetId
    ),
    recent_comments AS (
      SELECT 
        targetId as postId,
        COUNT(*) * ${COMMENT_WEIGHT} as comment_score
      FROM Comment
      WHERE createdAt >= ${startDate}
        AND createdAt <= ${endDate}
      GROUP BY targetId
    )
    SELECT 
      p.id as postId,
      COALESCE(f.favorite_score, 0) + 
      COALESCE(c.comment_score, 0) + 
      (p.viewCount * ${VIEW_WEIGHT}) as score
    FROM CommunityPost p
    LEFT JOIN recent_favorites f ON p.id = f.postId
    LEFT JOIN recent_comments c ON p.id = c.postId
    WHERE ${
      categoryId
        ? Prisma.sql`p.postCategoryId = ${categoryId}`
        : Prisma.sql`1=1`
    }
    ORDER BY score DESC
    LIMIT ${limit}
  `;

  // 점수가 있는 게시글 ID 목록
  const scoredPostIds = recentActivities.map((activity) => activity.postId);

  // 정렬된 순서대로 게시글 조회
  const trendingPosts = await prisma.communityPost.findMany({
    where: {
      id: {
        in: scoredPostIds,
      },
    },
  });

  // 정렬된 순서대로 반환
  const result = scoredPostIds.map(
    (postId) => trendingPosts.find((post) => post.id === postId)!
  );

  // limit보다 적으면 조회수 순으로 추가 게시글 조회
  if (result.length < limit) {
    const additionalPosts = await prisma.communityPost.findMany({
      where: {
        id: {
          notIn: scoredPostIds,
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
