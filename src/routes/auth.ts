import { Router } from 'express';
import { signup, login, logout } from '../controllers/auth.controller';
import { validateSignup, validateLogin } from '../middlewares/auth.validator';

const router = Router();

router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);
router.post('/logout', logout);

export default router; 