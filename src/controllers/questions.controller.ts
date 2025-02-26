import { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import prisma from '../lib/prisma';

export const viewQuestionDetail : RequestHandler = async(req, res) => {
    try{
        let {id} = req.params;
        const question_id = parseInt(id);

        const question = await prisma.question.findUnique({
            where: {id: question_id}
        });
        if(!question){
            res.status(StatusCodes.NOT_FOUND).json({message: "존재하지 않는 질문입니다."});
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
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '서버 오류가 발생했습니다.' });
    }
}