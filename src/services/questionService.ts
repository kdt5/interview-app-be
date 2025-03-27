import { Position, Prisma } from "@prisma/client";
import prisma from "../lib/prisma.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import weekOfYear from "dayjs/plugin/weekOfYear";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(weekOfYear);

export async function checkQuestionExists(questionId: number) {
  return (
    null !==
    (await prisma.question.findUnique({
      where: { id: questionId },
    }))
  );
}

export async function getQuestionById(questionId: number) {
  return await prisma.question.findUnique({
    where: { id: questionId },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
    },
  });
}

type WeeklyQuestionWithFormattedDate = {
  startDate: Date;
  formattedStartDate?: string; // Add the new property
  question: {
    id: number;
    title: string;
    content: string;
    categories: {
      categoryId: number;
    }[];
  };
};

export async function getWeeklyQuestion(): Promise<WeeklyQuestionWithFormattedDate | null> {
  const weekStart = dayjs()
    .tz("Asia/Seoul")
    .startOf("week")
    .add(1, "day")
    .toDate();
  
  const weeklyQuestion = await prisma.weeklyQuestion.findUnique({
    where: {
      startDate: weekStart,
    },
    select: { 
      startDate: true,
      question: {
        select: {
          id: true,
          title: true,
          content: true,
          categories: true
        }
      }
     },
  });

  if (weeklyQuestion && weeklyQuestion.startDate) {
    const formattedDate = `M-${dayjs(weeklyQuestion.startDate).tz('Asia/Seoul').format('MM')}-W-${dayjs(weeklyQuestion.startDate).tz('Asia/Seoul').week()}`;
    
    return { ...weeklyQuestion, formattedStartDate: formattedDate };
  }

  return weeklyQuestion;
}

export async function addWeeklyQuestion(questionId: number, startDate: string) {
  const parsedStartDate = dayjs(startDate)
    .tz("Asia/Seoul")
    .startOf("week")
    .add(1, "day")
    .toDate();
  
  return await prisma.weeklyQuestion.create({
    data: {
      startDate: parsedStartDate,
      questionId: questionId,
    },
  });
}

export async function getAllQuestionsWithCategories(
  position?: Position,
  categoryId?: number
) {
  const whereClause: Prisma.QuestionWhereInput = {};

  if (position && categoryId) {
    whereClause.categories = {
      some: {
        category: {
          position: position,
          id: categoryId,
        },
      },
    };
  } else if (position) {
    whereClause.categories = {
      some: {
        category: {
          position: position,
        },
      },
    };
  } else if (categoryId) {
    whereClause.categories = {
      some: {
        category: {
          id: categoryId,
        },
      },
    };
  }

  const questions = await prisma.question.findMany({
    where: whereClause,
    select: {
      id: true,
      title: true,
      categories: {
        select: {
          category: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  return questions.map((question) => ({
    id: question.id,
    title: question.title,
    categories: question.categories.map((qc) => qc.category.id),
  }));
}

export const questionService = {
  checkQuestionExists,
  getQuestionById,
  getWeeklyQuestion,
  addWeeklyQuestion,
  getAllQuestionsWithCategories,
}
