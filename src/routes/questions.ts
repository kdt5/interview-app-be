import { RequestHandler, Router } from "express";
import { getQuestionDetail, getWeeklyQuestionDetail, getAllQuestions } from "../controllers/questionsController";
import { validateGetAllQuestionQuery, validateGetQuestionDetail } from "../middlewares/questionsValidator";
import authMiddleware from "../middlewares/authMiddleware";
import { validateRecordAnswer } from "../middlewares/answerValidator";
import { recordAnswer } from "../controllers/answerController";

const router = Router();

router.get('/', authMiddleware.authenticate, validateGetAllQuestionQuery, getAllQuestions);
router.get('/weekly', authMiddleware.authenticate, getWeeklyQuestionDetail);
router.get('/:id', authMiddleware.authenticate, validateGetQuestionDetail, getQuestionDetail);
router
  .route("/:questionId/answers")
  .post(
    authMiddleware.authenticate,
    validateRecordAnswer,
    recordAnswer as RequestHandler
  );

export default router;