import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import passport from "passport";
import path from "path";
import router from "./app/routes";
import config from "./config/config";
import { configurePassport } from "./config/passport.config";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { NotFoundException } from "./errors/NotFoundException";
import getLogger from "./config/logger.config";

const app = express();

const logger = getLogger("app");

app.use(morgan("dev")); // dev, combined, common, short, tiny
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  "/uploads",
  express.static(path.join(path.resolve(), "public", "uploads"))
); // Serve static files

app.use(passport.initialize());
configurePassport();

app.use("/api/v1", router);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use((req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundException(`Route ${req.originalUrl} not found`));
});

app.use(globalErrorHandler);

const PORT = config.PORT || 4000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
