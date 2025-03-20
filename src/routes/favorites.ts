import { Router } from "express";
import {
  addFavorite,
  getFavorites,
  getFavoriteStatus,
  removeFavorite,
} from "../controllers/favoriteController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/mine", authMiddleware.authenticate, getFavorites);
router.get("/:questionId", authMiddleware.authenticate, getFavoriteStatus);
router.post("/:questionId", authMiddleware.authenticate, addFavorite);
router.delete("/:questionId", authMiddleware.authenticate, removeFavorite);

export default router;
