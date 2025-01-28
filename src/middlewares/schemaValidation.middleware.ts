import { ZodType } from "zod";
import { asyncHandler } from "../helpers/asyncHandler";
import { AppError } from "../errors/appError";
import { Request, Response, NextFunction } from "express";
import { BadRequestException } from "../errors/BadRequestException";
import responseFormatter from "../helpers/responseFormatter";
import getLogger from "../config/logger.config";

const logger = getLogger("schemaValidation.middleware");

export const validateReqQuery = (schema: ZodType) => {
  return asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = schema.safeParse(req.query);

      if (!result.success) {
        const errors: Record<string, string[]> = {};

        result.error.errors.forEach((err: any) => {
          const field = err.path.join("");
          const message = err.message;

          if (!errors[field]) {
            errors[field] = [];
          }
          errors[field].push(message);
        });

        logger.error("Bad Request", errors);
        responseFormatter(res, 400, "Bad Request", errors);
      }
      next();
    }
  );
};

export const validateReqParams = (schema: ZodType) => {
  return asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = schema.safeParse(req.params);

      if (!result.success) {
        const errors: Record<string, string[]> = {};

        result.error.errors.forEach((err: any) => {
          const field = err.path.join("");
          const message = err.message;

          if (!errors[field]) {
            errors[field] = [];
          }
          errors[field].push(message);
        });

        throw new BadRequestException(JSON.stringify(errors));
      }
      next();
    }
  );
};

export const validateReqBody = (schema: ZodType) => {
  return asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = schema.safeParse(req.body);

      if (!result.success) {
        const errors: Record<string, string[]> = {};

        result.error.errors.forEach((err: any) => {
          const field = err.path.join("");
          const message = err.message;

          if (!errors[field]) {
            errors[field] = [];
          }
          errors[field].push(message);
        });

        throw new BadRequestException(JSON.stringify(errors));
      }
      next();
    }
  );
};
