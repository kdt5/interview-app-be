import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma.js";
import answerService from "./answerService.js";
import { favoriteService } from "./favoriteService.js";
import { getWeeklyFormattedDate, getWeekStartDate } from "../utils/date.js";

export const questionService = {
  checkQuestionExists,
  getQuestionById,
  addWeeklyQuestion,
  getQuestions,
  getBasicQuestions,
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
  whereClause: Prisma.QuestionWhereInput
) {
  const questions = await prisma.question.findMany({
    where: whereClause,
    select: QuestionsSelect,
    orderBy: {
      id: "desc",
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

async function getWeeklyQuestion(weekStart: Date) {
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
    throw new Error("Weekly question not found");
  }

  const questionAnswerStatuses: boolean[] =
    await answerService.getAnsweredStatuses(weeklyQuestion.question.id, [
      weeklyQuestion.question.id,
    ]);

  const questionFavoriteStatuses: boolean[] =
    await favoriteService.getFavoriteStatuses(
      weeklyQuestion.question.id,
      "QUESTION",
      [weeklyQuestion.question.id]
    );

  const formattedWeeklyQuestion = {
    ...weeklyQuestion,
    question: {
      ...weeklyQuestion.question,
      _count: undefined,
      answerCount: weeklyQuestion.question._count.answers,
      isAnswered: questionAnswerStatuses[0],
      isFavorite: questionFavoriteStatuses[0],
      formattedStartDate: getWeeklyFormattedDate(weeklyQuestion.startDate),
    },
  };

  return formattedWeeklyQuestion;
}

async function getWeeklyQuestions(userId: number) {
  const weeklyQuestions = await prisma.weeklyQuestion.findMany({
    include: {
      question: {
        select: QuestionSelect,
      },
    },
    orderBy: {
      startDate: "desc",
    },
  });

  if (weeklyQuestions === null) {
    throw new Error("Weekly question not found");
  }

  const questionAnswerStatuses: boolean[] =
    await answerService.getAnsweredStatuses(
      userId,
      weeklyQuestions.map((weeklyQuestion) => weeklyQuestion.question.id)
    );

  const questionFavoriteStatuses: boolean[] =
    await favoriteService.getFavoriteStatuses(
      userId,
      "QUESTION",
      weeklyQuestions.map((weeklyQuestion) => weeklyQuestion.question.id)
    );

  const formattedWeeklyQuestions = weeklyQuestions.map(
    (weeklyQuestion, index) => {
      return {
        ...weeklyQuestion,
        _count: undefined,
        answerCount: weeklyQuestion.question._count.answers,
        isAnswered: questionAnswerStatuses[index],
        isFavorite: questionFavoriteStatuses[index],
        formattedStartDate: getWeeklyFormattedDate(weeklyQuestion.startDate),
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

async function getBasicQuestions(
  userId: number,
  positionId?: number,
  categoryId?: number
) {
  const whereInput: Prisma.QuestionWhereInput = {
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

  return await getQuestions(userId, whereInput);
}

async function getCurrentWeeklyQuestion() {
  const weekStart = getWeekStartDate();

  return await getWeeklyQuestion(weekStart);
}
