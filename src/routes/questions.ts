import { Router } from "express";
import {
  getQuestionDetail,
  getBasicQuestions,
  getCurrentWeeklyQuestion,
  addWeeklyQuestion,
  getWeeklyQuestions,
} from "../controllers/questionsController.js";
import {
  validateAddWeeklyQuestion,
  validateGetBasicQuestions,
  validateGetAnswers,
  validateGetQuestionDetail,
  validateGetWeeklyQuestions,
} from "../middlewares/questionsValidator.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getAnswers } from "../controllers/answerController.js";

const router = Router();

router.use(authMiddleware.authenticate);

router.get("/", validateGetBasicQuestions, getBasicQuestions);

router
  .route("/weekly")
  .get(validateGetWeeklyQuestions, getWeeklyQuestions)
  .post(validateAddWeeklyQuestion, addWeeklyQuestion);

router.route("/weekly/current").get(getCurrentWeeklyQuestion);

router.get("/:questionId", validateGetQuestionDetail, getQuestionDetail);

router.get("/:questionId/answers", validateGetAnswers, getAnswers);

export default router;
