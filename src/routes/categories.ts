import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getAllCategories } from "../controllers/categoriesController.js";
import { validateGetAllCategoriesQuery } from "../middlewares/categoriesValidator.js";

const router = Router();

router.get(
  "/",
  authMiddleware.authenticate,
  validateGetAllCategoriesQuery,
  getAllCategories
);

export default router;
