import { RequestHandler, Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";
import { deleteAnswer, editAnswer } from "../controllers/answerController";
import {
  validateDeleteAnswer,
  validateEditAnswer,
  validateRecordAnswer,
} from "../middlewares/answerValidator";
import { recordAnswer } from "../controllers/answerController";

const router = Router();

router.patch(
  "/:id",
  authMiddleware.authenticate,
  validateEditAnswer,
  editAnswer
);

router.delete(
  "/:id",
  authMiddleware.authenticate,
  validateDeleteAnswer,
  deleteAnswer
);

router.post(
  "/:questionId/answers",
  authMiddleware.authenticate,
  validateRecordAnswer,
  recordAnswer as RequestHandler
);

export default router;
