import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import { errorHandler } from './src/middlewares/errorHandler.js';
import authRouter from './src/routes/auth.js';
import usersRouter from './src/routes/users.js';
import questionsRouter from './src/routes/questions.js';

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/questions', questionsRouter);

app.use(errorHandler);

app.listen(process.env.PORT);
export default app;