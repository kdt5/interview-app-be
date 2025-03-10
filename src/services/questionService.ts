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

export const getAllQuestionsWithCategories = async () => {
    const questions = await prisma.question.findMany({
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
