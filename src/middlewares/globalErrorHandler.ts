import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import responseFormatter from "../helpers/responseFormatter";
import { AppError } from "../errors/appError";

const handlePrismaError = (err: Prisma.PrismaClientKnownRequestError) => {
  if (err.code === "P2002") {
    return new AppError(`Duplicate value for ${err.meta?.target}`, 400);
  }
  if (err.code === "P2025") {
    return new AppError("Record not found", 404);
  }
  if (err.code === "P2003") {
    return new AppError("Related record not found", 400);
  }
  return new AppError("Database error", 500);
};

export const globalErrorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = err;

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    error = handlePrismaError(err);
  }

  if (process.env.NODE_ENV === "development") {
    if (error instanceof AppError) {
      responseFormatter(res, error.statusCode, error.message, error.stack);
      return next();
    }
    responseFormatter(res, 500, error.message, error.stack);
    return next();
  }

  if (error instanceof AppError) {
    responseFormatter(res, error.statusCode, error.message, null);
    return next();
  }

  responseFormatter(res, 500, "Something went wrong", null);
  return next();
};
