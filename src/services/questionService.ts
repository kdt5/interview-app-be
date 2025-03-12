import { Position, Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

export const getQuestionById = async (questionId: number) => {
    return await prisma.question.findUnique({
        where: { id: questionId },
        include: {
            categories: {
                include: {
                    category: true
                }
            }
        }
    });
};

export const getWeeklyQuestion = async () => {
    return await prisma.question.findFirst({
        where: { isWeekly: true },
        include: {
            categories: {
                include: {
                    category: true
                }
            }
        }
    });
};

export const getAllQuestionsWithCategories = async (position? : Position, category? : string) => {
    const whereClause: Prisma.QuestionWhereInput = {};

    if(position && category){
        whereClause.categories = {
            some: {
                category: {
                    position: position,
                    name: category
                }
            }
        };
    } else if (position) {
        whereClause.categories = {
            some: {
                category: {
                    position: position
                }
            }
        };
    } else if (category) {
        whereClause.categories = {
            some: {
                category: {
                    name: category
                }
            }
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
                            name: true
                        }
                    }
                }
            }
        }
    });

    return questions.map(question => ({
        id: question.id,
        title: question.title,
        categories: question.categories.map(qc => qc.category.name)
    }))
};
