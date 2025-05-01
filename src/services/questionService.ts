import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma.js";
import answerService from "./answerService.js";
import { favoriteService } from "./favoriteService.js";
import { getWeeklyLabel, getWeekStartDate } from "../utils/date.js";
import { getPagination } from "../utils/pagination.js";
import { PaginationOptions } from "../types/pagination.js";

export const questionService = {
  checkQuestionExists,
  getQuestionById,
  addWeeklyQuestion,
  getQuestions,
  getWeeklyQuestions,
  increaseQuestionViewCount,
  getCurrentWeeklyQuestion,
};

async function checkQuestionExists(questionId: number) {
  return (
    null !==
    (await prisma.question.findUnique({
      where: { id: questionId },
    }))
  );
}

export const QuestionSelect: Prisma.QuestionSelect = {
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
  _count: {
    select: {
      answers: true,
    },
  },
};

async function getQuestionById(userId: number, questionId: number) {
  const question = await prisma.question.findUnique({
    select: QuestionSelect,
    where: { id: questionId },
  });

  if (question === null) {
    return null;
  }

  const formattedQuestions = await formatQuestionsWithUserData(userId, [
    question,
  ]);

  return formattedQuestions[0];
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
  pagination: PaginationOptions,
  options?: {
    categoryId?: number;
    positionId?: number;
  }
) {
  const { limit, page } = pagination;
  const { skip, take } = getPagination({ limit, page });
  const { categoryId, positionId } = options ?? {};

  const whereClause: Prisma.QuestionWhereInput = {
    weeklyQuestion: {
      is: null
    },
    categories: {
      some: {
        category: {
          id: categoryId,
          position: {
            id: positionId,
          },
        },
      },
    },
  };

  const questions = await prisma.question.findMany({
    where: whereClause,
    select: QuestionsSelect,
    orderBy: {
      id: "desc",
    },
    skip,
    take,
  });

  const formattedQuestions = await formatQuestionsWithUserData(
    userId,
    questions
  );

  return formattedQuestions;
}

async function getWeeklyQuestion(userId: number, weekStart: Date) {
  const weeklyQuestion = await prisma.weeklyQuestion.findUnique({
    where: {
      startDate: weekStart,
    },
    include: {
      question: {
        select: QuestionSelect,
      },
    },
  });

  if (weeklyQuestion === null) {
    return null;
  }

  const formattedQuestion = (
    await formatQuestionsWithUserData(userId, [weeklyQuestion.question])
  )[0];

  const formattedWeeklyQuestion = {
    ...weeklyQuestion,
    question: {
      ...formattedQuestion,
      weekLabel: getWeeklyLabel(weeklyQuestion.startDate),
    },
  };

  return formattedWeeklyQuestion;
}

async function getWeeklyQuestions(
  userId: number,
  pagination: PaginationOptions
) {
  const { limit, page } = pagination;
  const { skip, take } = getPagination({ limit, page });

  const weeklyQuestions = await prisma.weeklyQuestion.findMany({
    include: {
      question: {
        select: QuestionSelect,
      },
    },
    orderBy: {
      startDate: "desc",
    },
    skip,
    take,
  });

  const formattedQuestions = await formatQuestionsWithUserData(
    userId,
    weeklyQuestions.map((weeklyQuestion) => weeklyQuestion.question)
  );

  const formattedWeeklyQuestions = weeklyQuestions.map(
    (weeklyQuestion, index) => {
      return {
        ...weeklyQuestion,
        question: {
          ...formattedQuestions[index],
          weekLabel: getWeeklyLabel(weeklyQuestion.startDate),
        },
      };
    }
  );

  return formattedWeeklyQuestions;
}

async function addWeeklyQuestion(questionId: number, startDate: string) {
  const parsedStartDate = getWeekStartDate(startDate);

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

async function getCurrentWeeklyQuestion(userId: number) {
  const weekStart = getWeekStartDate();

  return await getWeeklyQuestion(userId, weekStart);
}

async function formatQuestionsWithUserData(
  userId: number,
  questions: Array<
    Prisma.QuestionGetPayload<{ select: typeof QuestionsSelect }>
  >
) {
  const questionAnswerStatuses = await answerService.getAnsweredStatuses(
    userId,
    questions.map((question) => question.id)
  );

  const questionFavoriteStatuses: boolean[] =
    await favoriteService.getFavoriteStatuses(
      userId,
      "QUESTION",
      questions.map((question) => question.id)
    );

  return questions.map((question, index) => {
    const { _count: count, ...rest } = question;
    return {
      ...rest,
      answerCount: count.answers,
      isAnswered: questionAnswerStatuses[index] !== undefined,
      isFavorite: questionFavoriteStatuses[index],
      answerId: questionAnswerStatuses[index]?.answerId,
    };
  });
}
