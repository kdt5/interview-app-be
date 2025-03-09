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
                questionDetail: {
                    id: question.id,
                    title: question.title,
                    content: question.content,
                    isWeekly: question.isWeekly,
                    createdAt: question.createdAt,
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
                questionDetail: {
                    id: question.id,
                    title: question.title,
                    content: question.content,
                    isWeekly: question.isWeekly,
                    createdAt: question.createdAt
                }
            });
        }

    } catch(error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
}

export const getAllQuestions : RequestHandler = async(req, res) => {

    try{
        const questions = await prisma.question.findMany({
            select: {
                id: true,
                title: true,
            }
        });

        if(!questions){
            res.status(StatusCodes.NOT_FOUND).json({message: "주간 질문이 존재하지 않습니다."});
        } else {
            try{
                const updatedQuestions = await Promise.all(
                    questions.map(async (question) => {
                        const categories = await prisma.questionCategory.findMany({
                            where: { questionId: question.id },
                            select: {
                                category: true,
                            },
                        });
                
                        return {
                            ...question,
                            category: categories.map(c => c.category.name),
                        };
                    })
                );
                
                res.status(StatusCodes.OK).json(updatedQuestions);
            } catch(error){
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
            }
        }
    } catch(error){
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
}