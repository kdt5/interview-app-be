import { Router } from "express";
import {
  getQuestionDetail,
  getWeeklyQuestionDetail,
  getAllQuestions,
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
router.get("/weekly", authMiddleware.authenticate, getWeeklyQuestionDetail);
router.get(
  "/:question-id",
  authMiddleware.authenticate,
  validateGetQuestionDetail,
  getQuestionDetail
);

export default router;
