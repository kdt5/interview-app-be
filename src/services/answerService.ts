import dbDayjs from '../lib/dayjs';
import prisma from '../lib/prisma';

export const updateAnswerTable = async (id: number, editAnswer: string) => {
    const newAnswer = await prisma.answer.update({
        where: {id: id},
        data: {
            content: editAnswer, 
            updatedAt: dbDayjs()
        }
    });

    return newAnswer;
}