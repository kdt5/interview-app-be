import prisma from "../lib/prisma.js";
import dbDayjs from "../lib/dayjs.js";
import {
  CommunityPost,
  FavoriteTargetType,
  Prisma,
  Question,
} from "@prisma/client";
import { format } from "path";

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

function getRecentFavoritesCte(
  targetType: FavoriteTargetType,
  weight: number,
  startDate: Date,
  endDate: Date
): Prisma.Sql {
  return Prisma.sql`
    SELECT 
      target_id as ${Prisma.raw(
        targetType === FavoriteTargetType.POST ? "postId" : "questionId"
      )},
      COUNT(*) * ${weight} as favorite_score
    FROM Favorite
    WHERE target_type = ${targetType}
      AND created_at >= ${startDate}
      AND created_at <= ${endDate}
    GROUP BY target_id
  `;
}

function getRecentCommentsCte(
  weight: number,
  startDate: Date,
  endDate: Date
): Prisma.Sql {
  return Prisma.sql`
    SELECT 
      post_id as postId,
      COUNT(*) * ${weight} as comment_score
    FROM Comment
    WHERE created_at >= ${startDate}
      AND created_at <= ${endDate}  
    GROUP BY post_id
  `;
}

function getRecentAnswersCte(
  weight: number,
  startDate: Date,
  endDate: Date
): Prisma.Sql {
  return Prisma.sql`
    SELECT 
      question_id as questionId,
      COUNT(*) * ${weight} as answer_score
    FROM Answer
    WHERE created_at >= ${startDate}
      AND created_at <= ${endDate}
    GROUP BY question_id
  `;
}

export interface UserCommunityPost {
  id: number;
  title: string;
  content: string;
  postCategoryId: number;
  userId: number;
  nickname: string;
  profileImageUrl: string;
  level: number;
  answerCount: number;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  favoriteCount: number;
}

export interface UserFormattedCommunityPost {
  id: number;
  title: string;
  content: string;
  postCategoryId: number;
  user: {
    id: number;
    nickname: string;
    profileImageUrl?: string;
    level: number;
    answerCount: number;
  }
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  favoriteCount: number;
}

async function getTrendingPosts(
  categoryId?: number,
  limit: number = 10
): Promise<UserFormattedCommunityPost[]> {
  // 최근 활동 점수 계산
  const trendingPosts = await prisma.$queryRaw<UserCommunityPost[]>`
    WITH recent_favorites AS (${getRecentFavoritesCte(
      FavoriteTargetType.POST,
      FAVORITE_WEIGHT,
      startDate,
      endDate
    )}),
    recent_comments AS (${getRecentCommentsCte(
      COMMENT_WEIGHT,
      startDate,
      endDate
    )})
    SELECT 
      p.id,
      p.title,
      p.content,
      p.created_at as createdAt,
      p.updated_at as updatedAt,
      p.view_count as viewCount,
      p.favorite_count as favoriteCount,
      p.post_category_id as postCategoryId,
      u.id as userId,
      u.nickname,
      u.profile_image_url as profileImageUrl,
      u.level,
      (
        SELECT COUNT(*)
        FROM Answer a
        WHERE a.user_id = u.id
      ) as answerCount
    FROM CommunityPost p
    JOIN User u ON p.user_id = u.id
    LEFT JOIN recent_favorites f ON p.id = f.postId
    LEFT JOIN recent_comments c ON p.id = c.postId
    WHERE ${
      categoryId
        ? Prisma.sql`p.post_category_id = ${categoryId}`
        : Prisma.sql`1=1`
    }
    ORDER BY (COALESCE(f.favorite_score, 0) + 
      COALESCE(c.comment_score, 0) + 
      (p.view_count * ${VIEW_WEIGHT})) DESC
    LIMIT ${limit}
  `;

  const formattedPosts: UserFormattedCommunityPost[] = trendingPosts.map((row) => ({
    id: row.id,
    title: row.title,
    content: row.content,
    postCategoryId: row.postCategoryId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    viewCount: row.viewCount,
    favoriteCount: row.favoriteCount,
    user: {
      id: row.userId,
      nickname: row.nickname,
      profileImageUrl: row.profileImageUrl,
      level: row.level,
      answerCount: Number(row.answerCount),
    },
  }));

  // limit보다 적으면 조회수 순으로 추가 게시글 조회
  if (trendingPosts.length < limit) {
    const additionalPosts = await prisma.communityPost.findMany({
      where: {
        id: {
          notIn: trendingPosts.map((post) => post.id),
        },
        postCategoryId: categoryId ? categoryId : undefined,
      },
      select: {
        id: true,
        title: true,
        content: true,
        postCategoryId: true,
        createdAt: true,
        updatedAt: true,
        viewCount: true,
        favoriteCount: true,
        user: {
          select: {
            id: true,
            nickname: true,
            profileImageUrl: true,
            level: true,
            _count: {
              select: {
                answers: true,
              },
            }
          }
        }
      },
      orderBy: {
        viewCount: "desc",
      },
      take: limit - trendingPosts.length,
    });

    const additionalFormattedPosts: UserFormattedCommunityPost[] = additionalPosts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      postCategoryId: post.postCategoryId,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      viewCount: post.viewCount,
      favoriteCount: post.favoriteCount,
      user: {
        id: post.user.id,
        nickname: post.user.nickname,
        profileImageUrl: post.user.profileImageUrl ?? undefined,
        level: post.user.level,
        answerCount: Number(post.user._count.answers),
      }
    }));

    formattedPosts.push(...additionalFormattedPosts);
  }

  return formattedPosts;
}

async function getTrendingQuestions(
  categoryId?: number,
  limit: number = 10
): Promise<Question[]> {
  // 최근 활동 점수 계산
  const trendingQuestions = await prisma.$queryRaw<Question[]>`
    WITH recent_favorites AS (${getRecentFavoritesCte(
      FavoriteTargetType.QUESTION,
      FAVORITE_WEIGHT,
      startDate,
      endDate
    )}),
    recent_answers AS (${getRecentAnswersCte(
      ANSWER_WEIGHT,
      startDate,
      endDate
    )})
    SELECT 
      q.*
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
    ORDER BY (COALESCE(f.favorite_score, 0) + 
      COALESCE(a.answer_score, 0) + 
      (q.view_count * ${VIEW_WEIGHT})) DESC
    LIMIT ${limit}
  `;

  // limit보다 적으면 조회수 순으로 추가 질문 조회
  if (trendingQuestions.length < limit) {
    const additionalQuestions = await prisma.question.findMany({
      where: {
        id: {
          notIn: trendingQuestions.map((question) => question.id),
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
      take: limit - trendingQuestions.length,
    });

    trendingQuestions.push(...additionalQuestions);
  }

  return trendingQuestions;
}

export default trendingService;
