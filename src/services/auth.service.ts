import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { prisma } from "../config/database.config";
import {
  comparePasswords,
  generateToken,
  hashPassword,
  verifyToken
} from "../utils/auth.utils";
import { AppError } from "../helpers/appError";
import {
  changePasswordInput,
  forgotPasswordInput,
  loginInput,
  registerInput,
  resetPasswordInput,
  updateProfileInput
} from "../types/types";
import config from "../config/config";
import { sendEmail } from "../config/nodemailer.config";
import { User } from "@prisma/client";
import getLogger from "../config/logger.config";

const logger = getLogger("auth.service");

class AuthService {
  private readonly prisma = prisma;

  private async getUserByEmail(email: string) {
    return await this.prisma.user.findFirst({ where: { email } });
  }

  private async getUserById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async register(data: registerInput): Promise<void> {
    const userExists = await this.getUserByEmail(data.email);

    if (userExists) {
      throw new AppError("User already exists", 400);
    }

    const hashedPassword = await hashPassword(data.password);

    await this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword
      }
    });
  }

  async login(
    data: loginInput
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.getUserByEmail(data.email);

    if (!user || !user.password) {
      throw new AppError("User not found", 404);
    }

    const validPassword = await comparePasswords(data.password, user.password);
    if (!validPassword) {
      throw new AppError("Invalid credentials", 401);
    }

    const accessToken = generateToken({
      payload: { id: user.id },
      secret: config.ACCESS_TOKEN_SECRET!,
      expiresIn: config.ACCESS_TOKEN_EXPIRES_IN!
    });

    const refreshToken = generateToken({
      payload: { id: user.id },
      secret: config.REFRESH_TOKEN_SECRET!,
      expiresIn: config.REFRESH_TOKEN_EXPIRES_IN!
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    });

    return {
      accessToken,
      refreshToken
    };
  }

  async getMe(userId: string): Promise<Partial<User>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      omit: {
        password: true,
        refreshToken: true
      }
    });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user;
  }

  async updatePassword(
    userId: string,
    data: changePasswordInput
  ): Promise<void> {
    const user = await this.getUserById(userId);
    if (!user || !user.password) {
      throw new AppError("User not found", 404);
    }

    const validPassword = await comparePasswords(
      data.currentPassword,
      user.password
    );
    if (!validPassword) {
      throw new AppError("Current password is incorrect", 401);
    }

    const hashedPassword = await hashPassword(data.newPassword);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });
  }

  async updateProfile(
    userId: string,
    data: updateProfileInput
  ): Promise<Partial<User>> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data,
      omit: {
        password: true,
        refreshToken: true
      }
    });

    return updatedUser;
  }

  async deleteAccount(userId: string): Promise<void> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    await this.prisma.user.delete({
      where: { id: userId }
    });
  }

  async refreshToken(
    token: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const decoded = verifyToken(token, config.REFRESH_TOKEN_SECRET!);

    const user = await this.getUserById(decoded.id);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const accessToken = generateToken({
      payload: { id: user.id },
      secret: config.ACCESS_TOKEN_SECRET!,
      expiresIn: config.ACCESS_TOKEN_EXPIRES_IN!
    });
    const refreshToken = generateToken({
      payload: { id: user.id },
      secret: config.REFRESH_TOKEN_SECRET!,
      expiresIn: config.REFRESH_TOKEN_EXPIRES_IN!
    });

    return { accessToken, refreshToken };
  }

  async forgetPassword(data: forgotPasswordInput): Promise<void> {
    const user = await this.getUserByEmail(data.email);
    console.log(user);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const resetToken = generateToken({
      payload: { id: user.id },
      secret: config.RESET_PASSWORD_TOKEN_SECRET!,
      expiresIn: config.RESET_PASSWORD_TOKEN_EXPIRES_IN!
    });

    await sendEmail({
      email: user.email,
      subject: "Password Reset",
      message: "Click the link below to reset your password",
      html: `<a href="${config.CLIENT_URL}/reset-password/${resetToken}">Reset Password</a>`
    });
  }

  async resetPassword(token: string, data: resetPasswordInput): Promise<void> {
    const decoded = verifyToken(
      token,
      config.RESET_PASSWORD_TOKEN_SECRET!
    ) as JwtPayload;

    const user = await this.getUserById(decoded.id);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const hashedPassword = await hashPassword(data.password);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });
  }

  async logout(userId: string, accessToken: string): Promise<void> {
    if (!accessToken) {
      throw new AppError("Unauthorized access!", 401);
    }

    await Promise.all([
      this.prisma.blacklistToken.create({
        data: {
          userId,
          token: accessToken
        }
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { refreshToken: null }
      })
    ]);
  }

  async oauthCallback(user: User): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    if (!user) {
      logger.error("OAuth callback received no user");
      throw new AppError("Authentication failed", 401);
    }

    const accessToken = generateToken({
      payload: { id: user.id },
      secret: config.ACCESS_TOKEN_SECRET!,
      expiresIn: config.ACCESS_TOKEN_EXPIRES_IN!
    });

    const refreshToken = generateToken({
      payload: { id: user.id },
      secret: config.REFRESH_TOKEN_SECRET!,
      expiresIn: config.REFRESH_TOKEN_EXPIRES_IN!
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    });

    logger.info(`OAuth login successful for user: ${user.id}`);

    return { accessToken, refreshToken };
  }
}

export default AuthService;
