import { Router } from "express";
import {
  getQuestionDetail,
  getAllQuestions,
  getWeeklyQuestion,
  addWeeklyQuestion,
} from "../controllers/questionsController.js";
import {
  validateAddWeeklyQuestion,
  validateGetAllQuestionQuery,
  validateGetQuestionDetail,
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
  validateGetQuestionDetail,
  getQuestionDetail
);
export default router;
