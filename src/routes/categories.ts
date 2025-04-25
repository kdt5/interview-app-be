import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getCategories } from "../controllers/categoriesController.js";
import { validateGetCategories } from "../middlewares/categoriesValidator.js";

const router = Router();

router.get(
  "/",
  authMiddleware.authenticate,
  validateGetCategories,
  getCategories
);

export default router;
