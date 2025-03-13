import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";
import { deleteAnswer, editAnswer } from "../controllers/answerController";
import {
  validateDeleteAnswer,
  validateEditAnswer,
} from "../middlewares/answerValidator";

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

export default router;
