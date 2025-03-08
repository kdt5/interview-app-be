import { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import prisma from '../lib/prisma';

export const getQuestionDetail : RequestHandler = async(req, res) => {
    try{
        const {id} = req.params;
        const question_id = parseInt(id);

        const question = await prisma.question.findUnique({
            where: {id: question_id}
        });

        const categories = await prisma.questionCategory.findMany({
            where: {questionId: question_id},
            select: {
                category: true,
            },
        });
        
        if(!question || !categories){
            res.status(StatusCodes.NOT_FOUND).json({message: "존재하지 않는 질문입니다."});
        } else {
            res.status(StatusCodes.OK).json({
                question_detail: {
                    id: question.id,
                    title: question.title,
                    content: question.content,
                    is_weekly: question.isWeekly,
                    created_at: question.createdAt,
                    category: categories.map(c => c.category.name),
                }
            });
        }

    } catch(error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
}

export const getWeeklyQuestionDetail : RequestHandler = async(req, res) => {
    try{
        const question = await prisma.question.findFirst({
            where: {isWeekly: true}
        });

        if(!question){
            res.status(StatusCodes.NOT_FOUND).json({message: "주간 질문이 존재하지 않습니다."});
        } else {
            res.status(StatusCodes.OK).json({
                question_detail: {
                    id: question.id,
                    title: question.title,
                    content: question.content,
                    is_weekly: question.isWeekly,
                    created_at: question.createdAt
                }
            });
        }

    } catch(error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
}