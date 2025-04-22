import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorHandler } from "./src/middlewares/errorHandler.js";
import authRouter from "./src/routes/auth.js";
import usersRouter from "./src/routes/users.js";
import favoriteRouter from "./src/routes/favorites.js";
import questionsRouter from "./src/routes/questions.js";
import categoriesRouter from "./src/routes/categories.js";
import answersRouter from "./src/routes/answers.js";
import communityRouter from "./src/routes/posts.js";
import reportsRouter from "./src/routes/reports.js";
import rankingsRouter from "./src/routes/rankings.js";
import uploadRouter from "./src/routes/uploads.js";
import trendingRouter from "./src/routes/trending.js";
import { StatusCodes } from "http-status-codes";

const app = express();
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/favorites", favoriteRouter);
app.use("/api/questions", questionsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/answers", answersRouter);
app.use("/api/posts", communityRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/rankings", rankingsRouter);
app.use("/api/uploads", uploadRouter);
app.use("/api/trending", trendingRouter);

// 404 처리
app.use((req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    message: "요청한 리소스를 찾을 수 없습니다.",
  });
});

app.use(errorHandler);

app.listen(process.env.PORT);
console.log(`서버가 ${process.env.PORT} 포트에서 실행 중입니다.`);
export default app;
