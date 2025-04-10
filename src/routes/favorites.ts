import { Router } from "express";
import {
  addFavorite,
  getFavorites,
  getFavoriteStatus,
  removeFavorite,
} from "../controllers/favoriteController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { validateTargetId, validateTargetType } from "../middlewares/favoritesValidator.js";
import { validationErrorMiddleware } from "../middlewares/validationErrorMiddleware.js";

const router = Router();

router.get("/mine/:targetType", authMiddleware.authenticate, validateTargetType, validationErrorMiddleware, getFavorites);
router.get("/:targetType/:targetId", authMiddleware.authenticate, validateTargetType, validateTargetId, validationErrorMiddleware, getFavoriteStatus);
router.post("/:targetType/:targetId", authMiddleware.authenticate, validateTargetType, validateTargetId, validationErrorMiddleware, addFavorite);
router.delete("/:targetType/:targetId", authMiddleware.authenticate, validateTargetType, validateTargetId, validationErrorMiddleware, removeFavorite);

export default router;
