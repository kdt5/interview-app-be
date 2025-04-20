import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import weekOfYear from "dayjs/plugin/weekOfYear.js";
import answerService from "./answerService.js";
import { favoriteService } from "./favoriteService.js";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(weekOfYear);

export const questionService = {
  checkQuestionExists,
  getQuestionById,
  getWeeklyQuestion,
  addWeeklyQuestion,
  getQuestions,
  increaseQuestionViewCount,
};

async function checkQuestionExists(questionId: number) {
  return (
    null !==
    (await prisma.question.findUnique({
      where: { id: questionId },
    }))
  );
}

const QuestionSelect: Prisma.QuestionSelect = {
  id: true,
  title: true,
  content: true,
  createdAt: true,
  viewCount: true,
  favoriteCount: true,
  categories: {
    select: {
      category: {
        select: {
          id: true,
        },
      },
    },
  },
};

async function getQuestionById(questionId: number) {
  return await prisma.question.findUnique({
    select: QuestionSelect,
    where: { id: questionId },
  });
}

export const QuestionsSelect: Prisma.QuestionSelect = {
  id: true,
  title: true,
  createdAt: true,
  viewCount: true,
  favoriteCount: true,
  categories: {
    select: {
      category: {
        select: {
          id: true,
        },
      },
    },
  },
  _count: {
    select: {
      answers: true,
    },
  },
};

async function getQuestions(
  userId: number,
  positionId?: number,
  categoryId?: number
) {
  const whereClause: Prisma.QuestionWhereInput = {};

  if (positionId && categoryId) {
    whereClause.categories = {
      some: {
        category: {
          position: {
            id: positionId,
          },
          id: categoryId,
        },
      },
    };
  } else if (positionId) {
    whereClause.categories = {
      some: {
        category: {
          position: {
            id: positionId,
          },
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
    select: QuestionsSelect,
    orderBy: {
      createdAt: "desc",
    },
  });

  const questionAnswerStatuses: boolean[] =
    await answerService.getAnsweredStatuses(
      userId,
      questions.map((question) => question.id)
    );

  const questionFavoriteStatuses: boolean[] =
    await favoriteService.getFavoriteStatuses(
      userId,
      "QUESTION",
      questions.map((question) => question.id)
    );

  questions.map((question, index) => {
    return {
      ...question,
      isAnswered: questionAnswerStatuses[index],
      isFavorite: questionFavoriteStatuses[index],
    };
  });

  return questions;
}

async function getWeeklyQuestion() {
  const weekStart = dayjs()
    .tz("Asia/Seoul")
    .startOf("week")
    .add(1, "day")
    .toDate();

  const weeklyQuestion = await prisma.weeklyQuestion.findUnique({
    select: {
      startDate: true,
      question: {
        select: QuestionSelect,
      },
    },
    where: {
      startDate: weekStart,
    },
  });

  if (weeklyQuestion && weeklyQuestion.startDate) {
    const formattedDate = `M-${dayjs(weeklyQuestion.startDate)
      .tz("Asia/Seoul")
      .format("MM")}-W-${dayjs(weeklyQuestion.startDate)
      .tz("Asia/Seoul")
      .week()}`;

    return { ...weeklyQuestion, formattedStartDate: formattedDate };
  }

  return weeklyQuestion;
}

async function addWeeklyQuestion(questionId: number, startDate: string) {
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

async function increaseQuestionViewCount(questionId: number) {
  await prisma.question.update({
    where: { id: questionId },
    data: {
      viewCount: {
        increment: 1,
      },
    },
  });
}
