import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes'

export const validateGetQuestionDetail = (req: Request, res: Response, next: NextFunction): void => {
    let {id} = req.params;

    const questionIdRegex = /^[0-9]/;
    if(!questionIdRegex.test(id)){
        res.status(StatusCodes.BAD_REQUEST).json({message: "질문 아이디는 숫자만 가능합니다."});
        return;
    };

    next();
}