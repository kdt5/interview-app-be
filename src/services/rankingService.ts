import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma.js";

const rankingService = {
  getLikeCountRankings,
  getAnswerCountRankings,
  getTotalRankings,
  getUserRanking,
};

export interface RankingUser {
  nickname: string;
  rank: number;
  totalFavoriteCount: number;
  totalAnswerCount: number;
  totalScore: number;
}

export interface UserRanking {
  rank: number;
  totalFavoriteCount: number;
  totalAnswerCount: number;
  totalScore: number;
}

const validOrderFields = {
  total_favorite_count: Prisma.sql`total_favorite_count`,
  total_answer_count: Prisma.sql`total_answer_count`,
  total_score: Prisma.sql`total_score`,
};

function buildDateRangeClause(startDate?: Date, endDate?: Date): Prisma.Sql {
  if (startDate && endDate) {
    return Prisma.sql`WHERE created_at BETWEEN ${startDate.toISOString()} AND ${endDate.toISOString()}`;
  }
  return Prisma.sql``;
}

function getAnswerFavoritesCte(startDate?: Date, endDate?: Date): Prisma.Sql {
  return Prisma.sql`
        SELECT
            user_id,
            SUM(favorite_count) as answer_favorite_sum
        FROM Answer
        ${buildDateRangeClause(startDate, endDate)}
        GROUP BY user_id
    `;
}

function getPostFavoritesCte(startDate?: Date, endDate?: Date): Prisma.Sql {
  return Prisma.sql`
        SELECT
            user_id,
            SUM(favorite_count) as post_favorite_sum
        FROM CommunityPost
        ${buildDateRangeClause(startDate, endDate)}
        GROUP BY user_id
    `;
}

function getCommentFavoritesCte(startDate?: Date, endDate?: Date): Prisma.Sql {
  return Prisma.sql`
        SELECT
            user_id,
            SUM(favorite_count) as comment_favorite_sum
        FROM Comment
        ${buildDateRangeClause(startDate, endDate)}
        GROUP BY user_id
    `;
}

function getAnswerCountCte(startDate?: Date, endDate?: Date): Prisma.Sql {
  return Prisma.sql`
        SELECT
            user_id,
            COUNT(*) as answer_count
        FROM Answer
        ${buildDateRangeClause(startDate, endDate)}
        GROUP BY user_id
    `;
}

function getRankingBaseCte(startDate?: Date, endDate?: Date): Prisma.Sql {
  return Prisma.sql`
        WITH answer_counts AS (${getAnswerCountCte(startDate, endDate)}),
        answer_favorites AS (${getAnswerFavoritesCte(startDate, endDate)}),
        post_favorites AS (${getPostFavoritesCte(startDate, endDate)}),
        comment_favorites AS (${getCommentFavoritesCte(startDate, endDate)}),
        user_scores AS (
            SELECT
                u.id,
                u.nickname,
                COALESCE(af.answer_favorite_sum, 0) +
                COALESCE(pf.post_favorite_sum, 0) +
                COALESCE(cf.comment_favorite_sum, 0) as total_favorite_count,
                COALESCE(ac.answer_count, 0) as total_answer_count,
                (COALESCE(ac.answer_count, 0) +
                 COALESCE(af.answer_favorite_sum, 0) +
                 COALESCE(pf.post_favorite_sum, 0) +
                 COALESCE(cf.comment_favorite_sum, 0)) as total_score
            FROM User u
            LEFT JOIN answer_counts ac ON u.id = ac.user_id
            LEFT JOIN answer_favorites af ON u.id = af.user_id
            LEFT JOIN post_favorites pf ON u.id = pf.user_id
            LEFT JOIN comment_favorites cf ON u.id = cf.user_id
        )
    `;
}

async function getRankings(
  orderBy: "total_favorite_count" | "total_answer_count" | "total_score",
  limit: number = 100,
  startDate?: Date,
  endDate?: Date
): Promise<RankingUser[]> {
  const orderField = validOrderFields[orderBy];
  if (!orderField) {
    throw new Error(`Invalid orderBy: ${orderBy}`);
  }

  const rankings = await prisma.$queryRaw<RankingUser[]>`
        ${getRankingBaseCte(startDate, endDate)},
        ranked_users AS (
            SELECT
                nickname,
                total_favorite_count as totalFavoriteCount,
                total_answer_count as totalAnswerCount,
                total_score as totalScore,
                RANK() OVER (ORDER BY ${orderField} DESC) as rank
            FROM user_scores
        )
        SELECT *
        FROM ranked_users
        ORDER BY rank
        LIMIT ${limit}
    `;

  return rankings.map((ranking) => ({
    nickname: ranking.nickname,
    rank: Number(ranking.rank),
    totalFavoriteCount: Number(ranking.totalFavoriteCount),
    totalAnswerCount: Number(ranking.totalAnswerCount),
    totalScore: Number(ranking.totalScore),
  }));
}

async function getLikeCountRankings(
  limit: number = 100
): Promise<RankingUser[]> {
  return getRankings("total_favorite_count", limit);
}

async function getAnswerCountRankings(
  limit: number = 100
): Promise<RankingUser[]> {
  return getRankings("total_answer_count", limit);
}

async function getTotalRankings(
  limit: number = 100,
  startDate?: Date,
  endDate?: Date
): Promise<RankingUser[]> {
  return getRankings("total_score", limit, startDate, endDate);
}

async function getUserRanking(
  userId: number,
  startDate?: Date,
  endDate?: Date
): Promise<UserRanking | null> {
  const userRanking = await prisma.$queryRaw<
    {
      rank: string;
      totalScore: string;
      totalFavoriteCount: string;
      totalAnswerCount: string;
    }[]
  >`
        ${getRankingBaseCte(startDate, endDate)},
        ranked_users AS (
            SELECT
                id,
                total_favorite_count,
                total_answer_count,
                total_score,
                RANK() OVER (ORDER BY total_score DESC) as rank
            FROM user_scores
        )
        SELECT
            rank,
            total_score as totalScore,
            total_favorite_count as totalFavoriteCount,
            total_answer_count as totalAnswerCount
        FROM ranked_users
        WHERE id = ${userId}
    `;

  if (userRanking.length > 0) {
    const result = userRanking[0];
    return {
      rank: Number(result.rank),
      totalScore: Number(result.totalScore),
      totalFavoriteCount: Number(result.totalFavoriteCount),
      totalAnswerCount: Number(result.totalAnswerCount),
    };
  }
  return null;
}

export default rankingService;
