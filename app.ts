import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import authRouter from './src/routes/auth';
import usersRouter from './src/routes/users';


const app = express();
app.use(express.json());
app.use(cookieParser());

app.listen(process.env.PORT);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);

export default app;