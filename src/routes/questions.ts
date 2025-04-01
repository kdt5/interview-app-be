import { Router } from "express";
import {
  getQuestionDetail,
  getAllQuestions,
  getWeeklyQuestion,
  addWeeklyQuestion,
  getAllAnswers,
} from "../controllers/questionsController.js";
import {
  validateAddWeeklyQuestion,
  validateGetAllQuestionQuery,
  validateQuestionId,
} from "../middlewares/questionsValidator.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { validationErrorMiddleware } from "../middlewares/validationErrorMiddleware.js";

const router = Router();

router.get(
  "/",
  authMiddleware.authenticate,
  validateGetAllQuestionQuery,
  getAllQuestions
);
router.get("/weekly", authMiddleware.authenticate, getWeeklyQuestion);
router.post(
  "/weekly",
  authMiddleware.authenticate,
  validateAddWeeklyQuestion,
  validationErrorMiddleware,
  addWeeklyQuestion
);
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
  getAllAnswers
);
export default router;
