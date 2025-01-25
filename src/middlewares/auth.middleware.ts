import { User } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { JwtPayload, verify } from "jsonwebtoken";
import { prisma } from "../config/database.config";
import { AppError } from "../helpers/appError";
import config from "../config/config";
import { asyncHandler } from "../helpers/asyncHandler";
import getLogger from "../config/logger.config";

declare module "express" {
  interface Request {
    user?: Partial<User>;
  }
}

export const authMiddleware = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const logger = getLogger("auth.middleware");
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      logger.error("Token not provided");
      throw new AppError("Token not provided", 401);
    }

    const decoded = verify(token, config.ACCESS_TOKEN_SECRET!) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      omit: {
        password: true,
        refreshToken: true
      }
    });

    if (!user) {
      logger.error("User not found");
      throw new AppError("User not found", 404);
    }

    const isBlacklisted = await prisma.blacklistToken.findUnique({
      where: { token, userId: user.id }
    });

    if (isBlacklisted) {
      logger.error("Token blacklisted");
      throw new AppError("Token blacklisted", 401);
    }

    req.user = user;
    next();
  }
);
