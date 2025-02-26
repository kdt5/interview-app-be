import { Router } from 'express';
import { validateNickname, validatePassword } from '../middlewares/auth-validator';
import { changeNickname, changePassword } from '../controllers/auth-controller';
import authMiddleware from '../middlewares/auth-middleware';

const router = Router();

router.patch('/change-nickname', authMiddleware.authenticate, validateNickname, changeNickname);
router.patch('/change-password', authMiddleware.authenticate, validatePassword, changePassword);

export default router; 