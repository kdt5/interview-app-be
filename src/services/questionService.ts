import { Position, Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

export const getQuestionById = async (questionId: number) => {
    return await prisma.question.findUnique({
        where: { id: questionId },
    });
};

export const getCategoriesByQuestionId = async (questionId: number) => {
    return await prisma.questionCategory.findMany({
        where: { questionId: questionId },
        select: { category: true },
    });
};

export const getWeeklyQuestion = async () => {
    return await prisma.question.findFirst({
        where: { isWeekly: true },
    });
};

export const getAllQuestionsWithCategories = async (position? : string, category? : string) => {
    const whereClause: Prisma.QuestionWhereInput = {};

    if(position && category){
        whereClause.categories = {
            some: {
                category: {
                    position: position as Position,
                    name: category
                }
            }
        };
    } else if (position) {
        whereClause.categories = {
            some: {
                category: {
                    position: position as Position
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
        select: { id: true, title: true },
    });

    return await Promise.all(
        questions.map(async (question) => {
            const categories = await getCategoriesByQuestionId(question.id);
            return {
                ...question,
                category: categories.map((c) => c.category.name),
            };
        })
    );
};
