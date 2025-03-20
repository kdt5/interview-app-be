import { RequestHandler, Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";
import {
  deleteAnswer,
  editAnswer,
  getAnswer,
  getAnsweredQuestions,
} from "../controllers/answerController";
import {
  validateAnswerId,
  validateEditAnswer,
  validateRecordAnswer,
} from "../middlewares/answerValidator.js";
import { recordAnswer } from "../controllers/answerController.js";
import answersMiddleware from "../middlewares/answerMiddleware.js";

const router = Router();

router.get("/mine", authMiddleware.authenticate, getAnsweredQuestions);

router.get(
  "/:id",
  authMiddleware.authenticate,
  validateAnswerId,
  answersMiddleware.checkAnswerOwnership,
  getAnswer
);

router.patch(
  "/:id",
  authMiddleware.authenticate,
  validateEditAnswer,
  answersMiddleware.checkAnswerOwnership,
  editAnswer
);

router.delete(
  "/:id",
  authMiddleware.authenticate,
  validateAnswerId,
  answersMiddleware.checkAnswerOwnership,
  deleteAnswer
);

router.post(
  "/:questionId/answers",
  authMiddleware.authenticate,
  validateRecordAnswer,
  recordAnswer as RequestHandler
);

export default router;
