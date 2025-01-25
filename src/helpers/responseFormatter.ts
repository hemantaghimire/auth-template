import { Response } from "express";
import { PaginationMetadata } from "./paginationMetadata";
interface ResponseObject<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  error: unknown;
  paginationData?: PaginationMetadata;
}

export default function responseFormatter<T>(
  res: Response,
  statusCode: number,
  message?: string,
  data?: T,
  paginationData?: PaginationMetadata
) {
  const isSuccessStatus = statusCode >= 200 && statusCode < 300;

  const responseObject: ResponseObject<T> = {
    success: isSuccessStatus,
    message: message || getDefaultMessage(statusCode),
    data: isSuccessStatus ? data ?? null : null,
    error: !isSuccessStatus ? data : null,
    statusCode,
    paginationData
  };

  return res.status(statusCode).json(responseObject);
}

function getDefaultMessage(statusCode: number): string {
  const messageMap: Record<number, string> = {
    200: "Success",
    201: "Created",
    400: "Validation Error",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    409: "Conflict",
    500: "Server Error"
  };

  return messageMap[statusCode] || "Error";
}
