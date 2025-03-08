import { Router } from "express";
import { getQuestionDetail, getWeeklyQuestionDetail, getAllQuestions } from "../controllers/questionsController";
import { validateGetQuestionDetail } from "../middlewares/questions.validator";

const router = Router();

router.get('/', getAllQuestions);
router.get('/weekly', getWeeklyQuestionDetail);
router.get('/:id', validateGetQuestionDetail, getQuestionDetail);

export default router;