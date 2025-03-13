import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";
import { editAnswer } from "../controllers/answersController";
import { validateEditAnswer } from "../middlewares/answersValidator";

const router = Router();

router.patch(
  "/:id",
  authMiddleware.authenticate,
  validateEditAnswer,
  editAnswer
);
router.delete("/:id", authMiddleware.authenticate);

export default router;
