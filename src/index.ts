import express, { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import morgan from "morgan";
import config from "./config/config";
import { globalErrorHandler } from "./helpers/globalErrorHandler";
import router from "./routes";
import passport from "passport";
import { configurePassport } from "./config/passport.config";

const app = express();

export const prisma = new PrismaClient();

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

app.use(passport.initialize());
configurePassport();

app.use("/api/v1", router);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    status: "error",
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

app.use(globalErrorHandler);

const PORT = config.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
