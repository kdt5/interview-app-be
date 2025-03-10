import { Position } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes'

export const validateGetQuestionDetail = (req: Request, res: Response, next: NextFunction): void => {
    const {id} = req.params;

    const questionIdRegex = /^[0-9]+$/;
    if(!questionIdRegex.test(id)){
        res.status(StatusCodes.BAD_REQUEST).json({message: "질문 아이디는 숫자만 가능합니다."});
        return;
    }

    next();
}

export const validateGetAllQuestionQuery = (req: Request, res: Response, next: NextFunction): void => {
    const position = req.query.position as string | undefined;

    if(position && !Object.values(Position).includes(position as Position)){
        res.status(StatusCodes.BAD_REQUEST).json({message: "직무는 frontend 또는 backend만 가능합니다."});
        return;
    }

    next();
}