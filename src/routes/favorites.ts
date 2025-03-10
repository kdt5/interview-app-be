import { Router } from "express";
import {
  addFavorite,
  removeFavorite,
} from "../controllers/favoriteController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/:id", authMiddleware.authenticate, addFavorite);
router.delete("/:id", authMiddleware.authenticate, removeFavorite);

export default router;
