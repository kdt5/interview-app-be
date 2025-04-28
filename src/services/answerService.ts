import { DEFAULT_PAGINATION_OPTIONS } from "../constants/pagination.js";
import dbDayjs from "../lib/dayjs.js";
import prisma from "../lib/prisma.js";
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
  limit: number = DEFAULT_PAGINATION_OPTIONS.ANSWER.LIMIT,
  page: number = 1
) {
  const answeredQuestions = await prisma.answer.findMany({
    where: { userId: userId },
    include: {
      question: {
        select: QuestionsSelect,
      },
    },
    orderBy: {
      id: "desc",
    },
    skip: limit * (page - 1),
    take: limit,
  });

  return answeredQuestions;
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

async function getAnswers(questionId: number) {
  return await prisma.answer.findMany({
    where: { questionId },
    include: {
      user: {
        select: UserBasicInfoSelect,
      },
    },
    orderBy: {
      id: "desc",
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
  });

  const answeredQuestionIds = new Set(
    answeredQuestions.map((answeredQuestion) => answeredQuestion.questionId)
  );

  return questionIds.map((questionId) => {
    return answeredQuestionIds.has(questionId);
  });
}
