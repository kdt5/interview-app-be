import { Router } from "express";
import {
  addFavorite,
  removeFavorite,
} from "../controllers/favoriteController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/:question-id", authMiddleware.authenticate, addFavorite);
router.delete("/:question-id", authMiddleware.authenticate, removeFavorite);

export default router;
