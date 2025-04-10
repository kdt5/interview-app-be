import { Router } from "express";
import {
  addFavorite,
  getFavorites,
  getFavoriteStatus,
  removeFavorite,
} from "../controllers/favoriteController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/mine/:targetType", authMiddleware.authenticate, getFavorites);
router.get("/:targetType/:targetId", authMiddleware.authenticate, getFavoriteStatus);
router.post("/:targetType/:targetId", authMiddleware.authenticate, addFavorite);
router.delete("/:targetType/:targetId", authMiddleware.authenticate, removeFavorite);

export default router;
