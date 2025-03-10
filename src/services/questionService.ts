import prisma from '../lib/prisma';

export const getQuestionById = async (question_id: number) => {
    return await prisma.question.findUnique({
        where: { id: question_id },
    });
};

export const getCategoriesByQuestionId = async (question_id: number) => {
    return await prisma.questionCategory.findMany({
        where: { questionId: question_id },
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
