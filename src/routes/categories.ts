import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";
import { getAllCategories } from "../controllers/categoriesController";
import { validateGetAllCategoriesQuery } from "../middlewares/categoriesValidator";

const router = Router();

router.get('/', authMiddleware.authenticate, validateGetAllCategoriesQuery, getAllCategories);

export default router;