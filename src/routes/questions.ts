import { Router } from "express";
import { getQuestionDetail, getWeeklyQuestionDetail, getAllQuestions } from "../controllers/questionsController";
import { validateGetQuestionDetail } from "../middlewares/questionsValidator";
import authMiddleware from "../middlewares/authMiddleware";

const router = Router();

router.get('/', authMiddleware.authenticate, getAllQuestions);
router.get('/weekly', authMiddleware.authenticate, getWeeklyQuestionDetail);
router.get('/:id', authMiddleware.authenticate, validateGetQuestionDetail, getQuestionDetail);

export default router;