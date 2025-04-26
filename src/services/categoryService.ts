import prisma from "../lib/prisma.js";

export async function getCategories(positionId?: number) {
  return await prisma.category.findMany({
    where: {
      positionId: positionId,
    },
    select: {
      id: true,
      name: true,
    },
  });
}

export const categoryService = {
  getCategories,
};
