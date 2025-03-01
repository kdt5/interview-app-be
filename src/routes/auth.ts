import { Router } from 'express';
import { signup, login, logout, checkEmailAvailability, checkNicknameAvailability, refresh } from '../controllers/authController.js';
import { validateSignup, validateLogin, validateEmail, validateNickname } from '../middlewares/authValidator.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/check-email', validateEmail, checkEmailAvailability);
router.post('/check-nickname', validateNickname, checkNicknameAvailability);
router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);
router.post('/logout', authMiddleware.authenticate, logout);
router.post('/refresh', refresh);

export default router; 