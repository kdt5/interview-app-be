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
router.get("/:question-id", authMiddleware.authenticate, getFavoriteStatus);
router.post("/:question-id", authMiddleware.authenticate, addFavorite);
router.delete("/:question-id", authMiddleware.authenticate, removeFavorite);

export default router;
