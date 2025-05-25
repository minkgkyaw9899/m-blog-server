import consola from "consola";
import express, { type ErrorRequestHandler } from "express";
import createHttpError from "http-errors";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { responseFormatter } from "./utils/responseFormatter";
import authRouter from "./features/auth/auth.routes";
import postAuth from "./features/post/post.routes";
import { deserializeUser } from "./middlewares/deserializeUser";
import { db } from "./db";

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  })
);

app.use(morgan("dev"));

app.use(helmet());
app.use(
  rateLimit({
    windowMs: 1000 * 60,
    limit: 60,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const prefix = "/api/v1";

app.get(`${prefix}/check-health`, (req, res) => {
  const data = responseFormatter(200, "How are you?", { health: "Good" });
  res.status(200).json(data);
});

app.use(`${prefix}/auth`, authRouter);
app.use(`${prefix}/posts`, deserializeUser, postAuth);

app.use((_req, _res, next) => {
  next(createHttpError(404, "Your request not found"));
});

app.use(((err, _req, res, _next) => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong";
  res.status(status).json({
    meta: {
      status,
      message,
    },
    data: null,
  });
}) as ErrorRequestHandler);

const port = Bun.env.PORT;

const server = app.listen(port, () => {
  consola.success(
    `Server listening on port ${port} in ${Bun.env.NODE_ENV} mode`
  );
});

process.on("SIGINT", async () => {
  consola.info("Shutting down server");
  server.close();
  process.exit(0);
});

export default app;
