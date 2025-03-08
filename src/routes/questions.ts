import { Router } from "express";
import { getQuestionDetail, getWeeklyQuestionDetail } from "../controllers/questionsController";
import { validateGetQuestionDetail } from "../middlewares/questions.validator";

const router = Router();

router.get('/weekly', getWeeklyQuestionDetail);
router.get('/:id', validateGetQuestionDetail, getQuestionDetail);

export default router;