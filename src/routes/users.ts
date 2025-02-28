import { Router } from 'express';
import { validateNickname, validatePassword } from '../middlewares/authValidator.js';
import { changeNickname, changePassword } from '../controllers/authController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

router.patch('/change-nickname', authMiddleware.authenticate, validateNickname, changeNickname);
router.patch('/change-password', authMiddleware.authenticate, validatePassword, changePassword);

export default router; 