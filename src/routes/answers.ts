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
  "/:answer-id",
  authMiddleware.authenticate,
  validateAnswerId,
  answersMiddleware.checkAnswerOwnership,
  getAnswer
);

router.patch(
  "/:answer-id",
  authMiddleware.authenticate,
  validateEditAnswer,
  answersMiddleware.checkAnswerOwnership,
  editAnswer
);

router.delete(
  "/:answer-id",
  authMiddleware.authenticate,
  validateAnswerId,
  answersMiddleware.checkAnswerOwnership,
  deleteAnswer
);

router.post(
  "/:question-id",
  authMiddleware.authenticate,
  validateRecordAnswer,
  recordAnswer as RequestHandler
);

export default router;
