import prisma from "../lib/prisma.js";
import dbDayjs from "../lib/dayjs.js";
import {
  CommunityPost,
  FavoriteTargetType,
  Prisma,
  Question,
} from "@prisma/client";

const trendingService = {
  getTrendingPosts,
  getTrendingQuestions,
};

// 최근 15일 동안의 즐겨찾기 수와 댓글 수가 높고, 조회수가 높은 게시글을 추천
// TODO: 조회 시간을 저장하면 최근 조회에 가중치를 줄 수 있음
const startDate = dbDayjs({ days: -15 });
const endDate = dbDayjs();

// 가중치 상수
const FAVORITE_WEIGHT = 2; // 즐겨찾기 가중치
const COMMENT_WEIGHT = 1; // 댓글 가중치
const ANSWER_WEIGHT = 1; // 답변 가중치
const VIEW_WEIGHT = 0.3; // 조회수 가중치

async function getTrendingPosts(
  categoryId?: number,
  limit: number = 10
): Promise<CommunityPost[]> {
  // 최근 활동 점수 계산
  const recentActivities = await prisma.$queryRaw<
    { postId: number; score: number }[]
  >`
    WITH recent_favorites AS (
      SELECT 
        target_id as postId,
        COUNT(*) * ${FAVORITE_WEIGHT} as favorite_score
      FROM Favorite
      WHERE target_type = ${FavoriteTargetType.POST}
        AND created_at >= ${startDate}
        AND created_at <= ${endDate}
      GROUP BY target_id
    ),
    recent_comments AS (
      SELECT 
        post_id as postId,
        COUNT(*) * ${COMMENT_WEIGHT} as comment_score
      FROM Comment
      WHERE created_at >= ${startDate}
        AND created_at <= ${endDate}
      GROUP BY post_id
    )
    SELECT 
      p.id as postId,
      COALESCE(f.favorite_score, 0) + 
      COALESCE(c.comment_score, 0) + 
      (p.view_count * ${VIEW_WEIGHT}) as score
    FROM CommunityPost p
    LEFT JOIN recent_favorites f ON p.id = f.postId
    LEFT JOIN recent_comments c ON p.id = c.postId
    WHERE ${
      categoryId
        ? Prisma.sql`p.post_category_id = ${categoryId}`
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

async function getTrendingQuestions(
  categoryId?: number,
  limit: number = 10
): Promise<Question[]> {
  // 최근 활동 점수 계산
  const recentActivities = await prisma.$queryRaw<
    { questionId: number; score: number }[]
  >`
    WITH recent_favorites AS (
      SELECT 
        target_id as questionId,
        COUNT(*) * ${FAVORITE_WEIGHT} as favorite_score
      FROM Favorite
      WHERE target_type = ${FavoriteTargetType.QUESTION}
        AND created_at >= ${startDate}
        AND created_at <= ${endDate}
      GROUP BY target_id
    ),
    recent_answers AS (
      SELECT 
        question_id as questionId,
        COUNT(*) * ${ANSWER_WEIGHT} as answer_score
      FROM Answer
      WHERE created_at >= ${startDate}
        AND created_at <= ${endDate}
      GROUP BY question_id
    )
    SELECT 
      q.id as questionId,
      COALESCE(f.favorite_score, 0) + 
      COALESCE(a.answer_score, 0) + 
      (q.view_count * ${VIEW_WEIGHT}) as score
    FROM Question q
    LEFT JOIN recent_favorites f ON q.id = f.questionId
    LEFT JOIN recent_answers a ON q.id = a.questionId
    ${
      categoryId
        ? Prisma.sql`WHERE EXISTS (
      SELECT 1 FROM QuestionCategory qc 
      WHERE qc.question_id = q.id AND qc.category_id = ${categoryId}
    )`
        : Prisma.sql``
    }
    ORDER BY score DESC
    LIMIT ${limit}
  `;
  // 점수가 있는 질문 ID 목록
  const scoredQuestionIds = recentActivities.map(
    (activity) => activity.questionId
  );

  // 정렬된 순서대로 질문 조회
  const trendingQuestions = await prisma.question.findMany({
    where: {
      id: {
        in: scoredQuestionIds,
      },
    },
  });

  // 정렬된 순서대로 반환
  const result = scoredQuestionIds.map(
    (questionId) =>
      trendingQuestions.find((question) => question.id === questionId)!
  );

  // limit보다 적으면 조회수 순으로 추가 질문 조회
  if (result.length < limit) {
    const additionalQuestions = await prisma.question.findMany({
      where: {
        id: {
          notIn: scoredQuestionIds,
        },
        ...(categoryId
          ? {
              categories: {
                some: {
                  categoryId,
                },
              },
            }
          : {}),
      },
      orderBy: {
        viewCount: "desc",
      },
      take: limit - result.length,
    });

    result.push(...additionalQuestions);
  }

  return result;
}

export default trendingService;
