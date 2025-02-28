import { Router } from 'express';
import { signup, login, logout, checkEmailAvailability, checkNicknameAvailability } from '../controllers/authController';
import { validateSignup, validateLogin, validateEmail, validateNickname } from '../middlewares/authValidator';
import authMiddleware from '../middlewares/authMiddleware';

const router = Router();

router.post('/check-email', validateEmail, checkEmailAvailability);
router.post('/check-nickname', validateNickname, checkNicknameAvailability);
router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);
router.post('/logout', authMiddleware.authenticate, logout);

export default router; 