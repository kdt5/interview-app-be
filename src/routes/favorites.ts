import { Router } from "express";
import {
  addFavorites,
  removeFavorites,
} from "../controllers/favoriteControllers.js";

const router = Router();

router.post("/:id", addFavorites);
router.delete("/:id", removeFavorites);

export default router;
