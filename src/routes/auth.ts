import { Router } from 'express';
import { signup, login, logout, checkEmailAvailability, checkNicknameAvailability } from '../controllers/auth-controller';
import { validateSignup, validateLogin, validateEmail, validateNickname } from '../middlewares/auth-validator';
import authMiddleware from '../middlewares/auth-middleware';

const router = Router();

router.post('/check-email', validateEmail, checkEmailAvailability);
router.post('/check-nickname', validateNickname, checkNicknameAvailability);
router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);
router.post('/logout', authMiddleware.authenticate, logout);

export default router; 