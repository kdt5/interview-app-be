import 'dotenv/config';
import express from 'express';
import authRouter from './src/routes/auth.js';
import questionsRouter from './src/routes/questions.js';

const app = express();
app.use(express.json());

app.listen(process.env.PORT);
app.use('/api/auth', authRouter);
app.use('/api/questions', questionsRouter);

export default app;