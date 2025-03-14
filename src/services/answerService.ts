import dbDayjs from "../lib/dayjs";
import prisma from "../lib/prisma";

const answerService = {
  recordAnswer,
  updateAnswer,
  deleteAnswer,
  getAnswer,
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
    },
  });
}

export async function getAnswer(
  answerId: number
) {
  return await prisma.answer.findUnique({
    where: {id: answerId}
  });
}

export async function updateAnswer(id: number, editAnswer: string) {
  const newAnswer = await prisma.answer.update({
    where: { id: id },
    data: {
      content: editAnswer,
      updatedAt: dbDayjs(),
    },
  });

  return newAnswer;
}

export async function deleteAnswer(id: number) {
  const deletedAnswer = await prisma.answer.delete({
    where: { id: id },
  });

  return deletedAnswer;
}
