import { User } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { JwtPayload, verify } from "jsonwebtoken";
import { prisma } from "../config/database.config";
import config from "../config/config";
import { asyncHandler } from "../helpers/asyncHandler";
import getLogger from "../config/logger.config";
import { UnauthorizedException } from "../errors/UnauthorizedException";
import { NotFoundException } from "../errors/NotFoundException";

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
      logger.error("Unauthorized Access");
      throw new UnauthorizedException("Unauthorized Access");
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
      logger.error("Unauthorized Access");
      throw new NotFoundException("Unauthorized Access");
    }

    const isBlacklisted = await prisma.blacklistToken.findUnique({
      where: { token, userId: user.id }
    });

    if (isBlacklisted) {
      logger.error("Token blacklisted");
      throw new UnauthorizedException("Token blacklisted. Please login again");
    }

    req.user = user;
    next();
  }
);
