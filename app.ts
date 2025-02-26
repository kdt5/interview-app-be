import 'dotenv/config';
import express from 'express';
import authRouter from './src/routes/auth.js';
import cookieParser from 'cookie-parser';

const app = express();
app.use(express.json());
app.use(cookieParser());

app.listen(process.env.PORT);
app.use('/api/auth', authRouter);

export default app;