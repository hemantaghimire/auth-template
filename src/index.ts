import express, { Request, Response, NextFunction } from "express";
import { Server } from "socket.io";
import morgan from "morgan";

import { PrismaClient } from "@prisma/client";
import { createServer } from "http";
import cors from "cors";
import { globalErrorHandler } from "./helpers/globalErrorHandler";
import router from "./routes";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" }
});
export const prisma = new PrismaClient();

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

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

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  globalErrorHandler(err, req, res, next);
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
