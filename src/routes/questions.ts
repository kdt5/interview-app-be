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
  validateGetAllQuestion,
  validateQuestionId,
} from "../middlewares/questionsValidator.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { validationErrorMiddleware } from "../middlewares/validationErrorMiddleware.js";
import { getAnswers } from "../controllers/answerController.js";

const router = Router();

router.get(
  "/",
  authMiddleware.authenticate,
  validateGetAllQuestion,
  validationErrorMiddleware,
  getBasicQuestions
);

router
  .route("/weekly")
  .get(authMiddleware.authenticate, getWeeklyQuestions)
  .post(
    authMiddleware.authenticate,
    validateAddWeeklyQuestion,
    validationErrorMiddleware,
    addWeeklyQuestion
  );

router
  .route("/weekly/current")
  .get(authMiddleware.authenticate, getCurrentWeeklyQuestion);

router.get(
  "/:questionId",
  authMiddleware.authenticate,
  validateQuestionId,
  validationErrorMiddleware,
  getQuestionDetail
);

router.get(
  "/:questionId/answers",
  authMiddleware.authenticate,
  validateQuestionId,
  validationErrorMiddleware,
  getAnswers
);
export default router;
