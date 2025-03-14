import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";
import { deleteAnswer, editAnswer } from "../controllers/answersController";
import {
  validateDeleteAnswer,
  validateEditAnswer,
} from "../middlewares/answersValidator";
import { checkAnswerOwnership } from "../middlewares/answersMiddleware";

const router = Router();

router.patch(
  "/:id",
  authMiddleware.authenticate,
  validateEditAnswer,
  checkAnswerOwnership,
  editAnswer
);
router.delete(
  "/:id",
  authMiddleware.authenticate,
  validateDeleteAnswer,
  checkAnswerOwnership,
  deleteAnswer
);

export default router;
