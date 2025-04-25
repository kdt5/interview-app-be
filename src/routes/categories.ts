import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getCategories } from "../controllers/categoriesController.js";
import { validateGetCategoriesRequest } from "../middlewares/categoriesValidator.js";

const router = Router();

router.get(
  "/",
  authMiddleware.authenticate,
  validateGetCategoriesRequest,
  getCategories
);

export default router;
