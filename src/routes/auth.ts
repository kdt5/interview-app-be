import { Router } from 'express';
import { signup, login } from '../controllers/auth.controller';
import { validateSignup, validateLogin } from '../middlewares/auth.validator';

const router = Router();

router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);

export default router; 