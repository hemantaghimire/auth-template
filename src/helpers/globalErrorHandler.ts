import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import responseFormatter from "./responseFormatter";
import { AppError } from "./appError";

const handlePrismaError = (err: Prisma.PrismaClientKnownRequestError) => {
  // Unique constraint violation
  if (err.code === "P2002") {
    return new AppError(`Duplicate value for ${err.meta?.target}`, 400);
  }
  // Record not found
  if (err.code === "P2025") {
    return new AppError("Record not found", 404);
  }
  // Foreign key constraint failure
  if (err.code === "P2003") {
    return new AppError("Related record not found", 400);
  }
  return new AppError("Database error", 500);
};

const handleJWTError = () => new AppError("Invalid token", 401);
const handleJWTExpired = () => new AppError("Token expired", 401);

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = err;

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    error = handlePrismaError(err);
  } else if (err instanceof JsonWebTokenError) {
    error = handleJWTError();
  } else if (err instanceof TokenExpiredError) {
    error = handleJWTExpired();
  }


  if (process.env.NODE_ENV === "development") {
    if (error instanceof AppError) {
      return responseFormatter(
        res,
        error.statusCode,
        error.message,
        error.stack
      );
    }
    return responseFormatter(res, 500, error.message, error.stack);
  }

  // Production error response
  if (error instanceof AppError) {
    return responseFormatter(res, error.statusCode, error.message, null);
  }

  // Generic error for production
  return responseFormatter(res, 500, "Something went wrong", null);
};
