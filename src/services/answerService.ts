import { Prisma } from "@prisma/client";
import dbDayjs from "../lib/dayjs.js";
import prisma from "../lib/prisma.js";
import { PaginationOptions } from "../types/pagination.js";
import { getPagination } from "../utils/pagination.js";
import { QuestionSelect, QuestionsSelect } from "./questionService.js";
import { UserBasicInfoSelect } from "./userService.js";

const answerService = {
  recordAnswer,
  updateAnswer,
  deleteAnswer,
  getAnswer,
  getAnswers,
  getAnsweredQuestions,
  increaseAnswerViewCount,
  getAnsweredStatuses,
};
export default answerService;

async function recordAnswer(
  userId: number,
  questionId: number,
  content: string
) {
  return await prisma.answer.create({
    data: {
      userId,
      questionId,
      content,
      createdAt: dbDayjs(),
    },
  });
}

async function getAnsweredQuestions(
  userId: number,
  pagination: PaginationOptions,
  filter?: 'basic' | 'weekly'
) {
  const { limit, page } = pagination;
  const { skip, take } = getPagination({ limit, page });

  const whereClause: Prisma.AnswerWhereInput = {
    userId,
  };

  if (filter === 'basic') {
    whereClause.question = { isWeekly: false };
  } else if (filter === 'weekly') {
    whereClause.question = { isWeekly: true };
  }

  const answeredQuestions = await prisma.answer.findMany({
    where: whereClause,
    include: {
      question: {
        select: QuestionsSelect,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take,
  });

  const transformed = answeredQuestions.map((answer) => {
    const { question } = answer;
    const { _count: count, ...restQuestion } = question;

    return {
      ...answer,
      question: {
        ...restQuestion,
        answerCount: count.answers,
      },
    };
  });

  return transformed;
}

async function getAnswer(answerId: number) {
  return await prisma.answer.findUnique({
    where: { id: answerId },
    include: {
      user: {
        select: UserBasicInfoSelect,
      },
      question: {
        select: QuestionSelect,
      },
    },
  });
}

async function getAnswers(questionId: number, pagination: PaginationOptions) {
  const { limit, page } = pagination;
  const { skip, take } = getPagination({ limit, page });

  const answers = await prisma.answer.findMany({
    where: { questionId },
    include: {
      user: {
        select: UserBasicInfoSelect,
      },
    },
    orderBy: {
      id: "desc",
    },
    skip,
    take,
  });

  return answers.map((answer) => (
    {
      ...answer,
      user: {
        id: answer.user.id,
        nickname: answer.user.nickname,
        profileImageUrl: (answer.user.profileImageUrl as string | undefined) ?? null,
        level: (answer.user.level as number | undefined) ?? 0,
        answerCount: answer.user._count.answers,
      }
    }
  ));
}

async function updateAnswer(answerId: number, editAnswer: string) {
  const newAnswer = await prisma.answer.update({
    where: { id: answerId },
    data: {
      content: editAnswer,
      updatedAt: dbDayjs(),
    },
  });

  return newAnswer;
}

async function deleteAnswer(answerId: number) {
  const deletedAnswer = await prisma.answer.delete({
    where: { id: answerId },
  });

  return deletedAnswer;
}

async function increaseAnswerViewCount(answerId: number) {
  const updatedAnswer = await prisma.answer.update({
    where: { id: answerId },
    data: {
      viewCount: {
        increment: 1,
      },
    },
  });

  return updatedAnswer;
}

async function getAnsweredStatuses(userId: number, questionIds: number[]) {
  const answeredQuestions = await prisma.answer.findMany({
    where: {
      userId,
      questionId: {
        in: questionIds,
      },
    },
  });

  const answeredQuestionIds = new Set(
    answeredQuestions.map((answeredQuestion) => answeredQuestion.questionId)
  );

  return questionIds.map((questionId) => {
    return answeredQuestionIds.has(questionId);
  });
}
