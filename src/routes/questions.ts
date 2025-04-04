import { Router } from "express";
import {
  getQuestionDetail,
  getQuestions,
  getWeeklyQuestion,
  addWeeklyQuestion,
  getAnswers,
} from "../controllers/questionsController.js";
import {
  validateAddWeeklyQuestion,
  validateGetAllQuestion,
  validateQuestionId,
} from "../middlewares/questionsValidator.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { validationErrorMiddleware } from "../middlewares/validationErrorMiddleware.js";

const router = Router();

router.get(
  "/",
  authMiddleware.authenticate,
  validateGetAllQuestion,
  validationErrorMiddleware,
  getQuestions
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
  getAnswers
);
export default router;
