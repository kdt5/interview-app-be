import { Position, Prisma } from "@prisma/client";
import prisma from "../lib/prisma";

export async function getPositionCategories(position?: Position) {
  const whereClause: Prisma.CategoryWhereInput = position
    ? { position: position }
    : {};

  const categories = await prisma.category.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
    },
  });

  return categories;
}
