import { Position, Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

export const getPositionCategories = async (position? : Position) => {
    const whereClause: Prisma.CategoryWhereInput = position ? {position: position} : {};

    const categories = await prisma.category.findMany({
        where: whereClause,
        select: {
            id: true,
            name: true
        }
    });

    return categories;
}