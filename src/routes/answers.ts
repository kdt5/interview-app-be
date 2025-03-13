import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";
import { deleteAnswer, editAnswer } from "../controllers/answersController";
import {
  validateDeleteAnswer,
  validateEditAnswer,
} from "../middlewares/answersValidator";

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
