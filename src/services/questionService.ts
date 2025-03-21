import { Position, Prisma } from "@prisma/client";
import prisma from "../lib/prisma.js";

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

export async function getWeeklyQuestion() {
  return await prisma.question.findFirst({
    where: { isWeekly: true },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
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
