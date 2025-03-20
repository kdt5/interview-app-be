import { Router } from "express";
import {
  addFavorite,
  getFavorites,
  removeFavorite,
} from "../controllers/favoriteController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/mine", authMiddleware.authenticate, getFavorites);
router.post("/:id", authMiddleware.authenticate, addFavorite);
router.delete("/:id", authMiddleware.authenticate, removeFavorite);

export default router;
