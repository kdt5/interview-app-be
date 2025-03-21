import dbDayjs from "../lib/dayjs.js";
import prisma from "../lib/prisma.js";

const answerService = {
  recordAnswer,
  updateAnswer,
  deleteAnswer,
  getAnswer,
  getAnsweredQuestions,
};
export default answerService;

export async function recordAnswer(
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

export async function getAnsweredQuestions(userId: number) {
  return await prisma.answer.findMany({
    where: { userId: userId },
    select: {
      id: true,
      question: {
        select: {
          id: true,
          title: true,
          categories: true,
        },
      },
    },
  });
}

export async function getAnswer(answerId: number) {
  return await prisma.answer.findUnique({
    where: { id: answerId },
  });
}

export async function updateAnswer(answerId: number, editAnswer: string) {
  const newAnswer = await prisma.answer.update({
    where: { id: answerId },
    data: {
      content: editAnswer,
      updatedAt: dbDayjs(),
    },
  });

  return newAnswer;
}

export async function deleteAnswer(answerId: number) {
  const deletedAnswer = await prisma.answer.delete({
    where: { id: answerId },
  });

  return deletedAnswer;
}
