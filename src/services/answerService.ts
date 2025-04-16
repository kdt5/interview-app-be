import { Prisma } from "@prisma/client";
import dbDayjs from "../lib/dayjs.js";
import prisma from "../lib/prisma.js";

const answerService = {
  recordAnswer,
  updateAnswer,
  deleteAnswer,
  getAnswer,
  getAnswers,
  getAnsweredQuestions,
  increaseAnswerViewCount,
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

async function getAnsweredQuestions(userId: number) {
  return await prisma.answer.findMany({
    where: { userId: userId },
    select: {
      id: true,
      question: {
        select: {
          id: true,
          title: true,
          categories: {
            select: {
              categoryId: true,
            },
          },
          viewCount: true,
        },
      },
    },
  });
}

const AnswerSelect: Prisma.AnswerSelect = {
  id: true,
  content: true,
  user: {
    select: {
      id: true,
      nickname: true,
    },
  },
  createdAt: true,
  updatedAt: true,
  viewCount: true,
  favoriteCount: true,
};

async function getAnswer(answerId: number) {
  return await prisma.answer.findUnique({
    where: { id: answerId },
    select: AnswerSelect,
  });
}

async function getAnswers(questionId: number) {
  return await prisma.answer.findMany({
    where: { questionId },
    select: AnswerSelect,
  });
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
