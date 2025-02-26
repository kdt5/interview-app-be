import { Router } from "express";
import { viewQuestionDetail } from "../controllers/questions.controller";
import { validateGetQuestionDetail } from "../middlewares/questions.validator";

const router = Router();

router.get('/:id', validateGetQuestionDetail, viewQuestionDetail);

export default router;