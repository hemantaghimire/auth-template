import { ZodType } from "zod";
import { asyncHandler } from "../helpers/asyncHandler";
import { AppError } from "../helpers/appError";
import { Request, Response, NextFunction } from "express";

const validateSchema = (schema: ZodType) => {
  return asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      if (req.body.themeCollectionId) {
        req.body.themeCollectionId = Number(req.body.themeCollectionId);
      }

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

        throw new AppError(Object.values(errors).join(","), 400);
      }
      next();
    }
  );
};

export default validateSchema;
