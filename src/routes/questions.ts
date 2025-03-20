import { Router } from "express";
import {
  getQuestionDetail,
  getWeeklyQuestionDetail,
  getAllQuestions,
} from "../controllers/questionsController";
import {
  validateGetAllQuestionQuery,
  validateGetQuestionDetail,
} from "../middlewares/questionsValidator";
import authMiddleware from "../middlewares/authMiddleware";

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
