import { RequestHandler, Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { deleteAnswer, editAnswer } from "../controllers/answerController.js";
import {
  validateDeleteAnswer,
  validateEditAnswer,
  validateRecordAnswer,
} from "../middlewares/answerValidator.js";
import { recordAnswer } from "../controllers/answerController.js";
import answersMiddleware from "../middlewares/answerMiddleware.js";

const router = Router();

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
  validateDeleteAnswer,
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
