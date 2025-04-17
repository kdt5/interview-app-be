import { Prisma } from "@prisma/client";
import dbDayjs from "../lib/dayjs.js";
import prisma from "../lib/prisma.js";
import { QuestionsSelect } from "./questionService.js";

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

async function getAnsweredQuestions(userId: number) {
  const answeredQuestions = await prisma.answer.findMany({
    where: { userId: userId },
    select: {
      ...AnswerSelect,
      question: {
        select: QuestionsSelect,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const mappedAnsweredQuestions = answeredQuestions.map((answeredQuestion) => {
    return {
      question: {
        ...answeredQuestion.question,
      },
      answer: {
        ...answeredQuestion,
        question: undefined,
      },
    };
  });

  return mappedAnsweredQuestions;
}

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
    orderBy: {
      createdAt: "desc",
    },
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

async function getAnsweredStatuses(userId: number, questionIds: number[]) {
  const answeredQuestions = await prisma.answer.findMany({
    where: {
      userId,
      questionId: {
        in: questionIds,
      },
    },
    select: {
      questionId: true,
    },
  });

  const answeredQuestionIds = answeredQuestions.map(
    (answeredQuestion) => answeredQuestion.questionId
  );

  return questionIds.map((questionId) => {
    return answeredQuestionIds.includes(questionId);
  });
}
