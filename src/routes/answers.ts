import { Router } from "express";
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
  validateGetAnsweredQuestions,
  validateRecordAnswer,
} from "../middlewares/answerValidator.js";
import { recordAnswer } from "../controllers/answerController.js";
import answersMiddleware from "../middlewares/answerMiddleware.js";

const router = Router();

router.use(authMiddleware.authenticate);

router.get("/mine", validateGetAnsweredQuestions, getAnsweredQuestions);

router.get(
  "/:answerId/ownership",
  validateAnswerId,
  answersMiddleware.checkAnswerOwnership,
  (req, res) => {
    res.status(200).json(true);
  }
);

router.get(
  "/:answerId",
  validateAnswerId,
  answersMiddleware.checkAnswerOwnership,
  getAnswer
);

router.patch(
  "/:answerId",
  validateEditAnswer,
  answersMiddleware.checkAnswerOwnership,
  editAnswer
);

router.delete(
  "/:answerId",
  validateAnswerId,
  answersMiddleware.checkAnswerOwnership,
  deleteAnswer
);

router.post("/:questionId", validateRecordAnswer, recordAnswer);

export default router;
