import { Router } from "express";
import {
  getQuestionDetail,
  getAllQuestions,
  getWeeklyQuestion,
  addWeeklyQuestion,
} from "../controllers/questionsController.js";
import {
  validateGetAllQuestionQuery,
  validateGetQuestionDetail,
} from "../middlewares/questionsValidator.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

router.get(
  "/",
  authMiddleware.authenticate,
  validateGetAllQuestionQuery,
  getAllQuestions
);
router.get("/weekly", authMiddleware.authenticate, getWeeklyQuestion);
router.post(
  "/weekly/:questionId",
  authMiddleware.authenticate,
  addWeeklyQuestion
);
router.get(
  "/:questionId",
  authMiddleware.authenticate,
  validateGetQuestionDetail,
  getQuestionDetail
);
export default router;
