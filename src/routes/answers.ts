import { RequestHandler, Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  deleteAnswer,
  editAnswer,
  getAnswer,
  getAnsweredQuestions,
} from "../controllers/answerController.js";
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
  "/:answerId",
  authMiddleware.authenticate,
  validateAnswerId,
  answersMiddleware.checkAnswerOwnership,
  getAnswer
);

router.patch(
  "/:answerId",
  authMiddleware.authenticate,
  validateEditAnswer,
  answersMiddleware.checkAnswerOwnership,
  editAnswer
);

router.delete(
  "/:answerId",
  authMiddleware.authenticate,
  validateAnswerId,
  answersMiddleware.checkAnswerOwnership,
  deleteAnswer
);

router.post(
  "/:questionId",
  authMiddleware.authenticate,
  validateRecordAnswer,
  recordAnswer as RequestHandler
);

export default router;
