import { Router } from 'express';
import { validateNickname, validatePassword } from '../middlewares/authValidator';
import { changeNickname, changePassword } from '../controllers/authController';
import authMiddleware from '../middlewares/authMiddleware';

const router = Router();

router.patch('/change-nickname', authMiddleware.authenticate, validateNickname, changeNickname);
router.patch('/change-password', authMiddleware.authenticate, validatePassword, changePassword);

export default router; 