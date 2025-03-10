import { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
    getQuestionById,
    getCategoriesByQuestionId,
    getWeeklyQuestion,
    getAllQuestionsWithCategories
} from '../services/questionService';

export const getQuestionDetail: RequestHandler = async (req, res) => {
    try {
        const questionId = parseInt(req.params.id);
        const question = await getQuestionById(questionId);
        const categories = await getCategoriesByQuestionId(questionId);

        if (!question || !categories) {
            res.status(StatusCodes.NOT_FOUND).json({ message: "존재하지 않는 질문입니다." });
            return;
        }

        res.status(StatusCodes.OK).json({
            questionDetail: {
                id: question.id,
                title: question.title,
                content: question.content,
                isWeekly: question.isWeekly,
                createdAt: question.createdAt,
                category: categories.map((c) => c.category.name),
            },
        });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
};

export const getWeeklyQuestionDetail: RequestHandler = async (req, res) => {
    try {
        const question = await getWeeklyQuestion();

        if (!question) {
            res.status(StatusCodes.NOT_FOUND).json({ message: "주간 질문이 존재하지 않습니다." });
            return;
        }

        res.status(StatusCodes.OK).json({
            questionDetail: {
                id: question.id,
                title: question.title,
                content: question.content,
                isWeekly: question.isWeekly,
                createdAt: question.createdAt,
            },
        });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
};

export const getAllQuestions: RequestHandler = async (req, res) => {
    try {
        const position = typeof req.query.position === "string" ? req.query.position : undefined;
        const category = typeof req.query.category === "string" ? req.query.category : undefined;

        const questions = await getAllQuestionsWithCategories(position, category);
        if(questions.length === 0){
            res.status(StatusCodes.NOT_FOUND).json({ message: "조건에 해당하는 질문이 존재하지 않습니다." });
            return;
        }

        res.status(StatusCodes.OK).json(questions);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
};
