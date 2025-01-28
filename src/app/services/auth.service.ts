import { User } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
import config from "../../config/config";
import { prisma } from "../../config/database.config";
import getLogger from "../../config/logger.config";
import { sendEmail } from "../../config/nodemailer.config";
import { ConflictException } from "../../errors/ConflictException";
import { NotFoundException } from "../../errors/NotFoundException";
import { UnauthorizedException } from "../../errors/UnauthorizedException";

import {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  UpdateProfileInput
} from "../../validators/auth.validator";

import {
  comparePasswords,
  generateToken,
  hashPassword,
  verifyToken
} from "../../utils/auth.utils";

export class AuthService {
  private readonly prisma = prisma;
  private logger = getLogger("auth.service");

  private async getUserByEmail(email: string) {
    return await this.prisma.user.findFirst({ where: { email } });
  }

  private async getUserById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  private async generateAccessAndRefreshTokens(id: string) {
    const accessToken = generateToken({
      payload: { id },
      secret: config.ACCESS_TOKEN_SECRET!,
      expiresIn: config.ACCESS_TOKEN_EXPIRES_IN
    });

    const refreshToken = generateToken({
      payload: { id },
      secret: config.REFRESH_TOKEN_SECRET!,
      expiresIn: config.REFRESH_TOKEN_EXPIRES_IN
    });

    return { accessToken, refreshToken };
  }

  async register(data: RegisterInput): Promise<void> {
    const userExists = await this.getUserByEmail(data.email);

    if (userExists) {
      throw new ConflictException("User already exists");
    }

    const hashedPassword = await hashPassword(data.password);

    await this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword
      }
    });

    this.logger.info(`User with email ${data.email} registered successfully`);
  }

  async login(
    data: LoginInput
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.getUserByEmail(data.email);

    if (!user || !user.password) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const validPassword = await comparePasswords(data.password, user.password);
    if (!validPassword) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const { accessToken, refreshToken } =
      await this.generateAccessAndRefreshTokens(user.id);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    });

    this.logger.info(`User with email ${data.email} logged in successfully`);

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
      throw new NotFoundException("User not found");
    }

    this.logger.info(`User with id ${userId} retrieved successfully`);

    return user;
  }

  async updatePassword(
    userId: string,
    data: ChangePasswordInput
  ): Promise<void> {
    const user = await this.getUserById(userId);
    if (!user || !user.password) {
      throw new NotFoundException("User not found");
    }

    const validPassword = await comparePasswords(
      data.currentPassword,
      user.password
    );
    if (!validPassword) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const hashedPassword = await hashPassword(data.newPassword);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    this.logger.info(`Password updated for user with id ${userId}`);
  }

  async updateProfile(
    userId: string,
    data: UpdateProfileInput
  ): Promise<Partial<User>> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data,
      omit: {
        password: true,
        refreshToken: true
      }
    });
    this.logger.info(`Profile updated for user with id ${userId}`);
    return updatedUser;
  }

  async deleteAccount(userId: string): Promise<void> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    await this.prisma.user.delete({
      where: { id: userId }
    });
    this.logger.info(`User with id ${userId} deleted successfully`);
  }

  async refreshToken(
    token: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const decoded = verifyToken(token, config.REFRESH_TOKEN_SECRET!);

    const user = await this.getUserById(decoded.id);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.refreshToken !== token) {
      throw new UnauthorizedException("Invalid token");
    }

    const { accessToken, refreshToken } =
      await this.generateAccessAndRefreshTokens(user.id);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    });

    this.logger.info(`Refresh token generated for user with id ${user.id}`);

    return { accessToken, refreshToken };
  }

  async forgetPassword(data: ForgotPasswordInput): Promise<void> {
    const user = await this.getUserByEmail(data.email);
    console.log(user);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const resetToken = generateToken({
      payload: { id: user.id },
      secret: config.RESET_PASSWORD_TOKEN_SECRET!,
      expiresIn: config.RESET_PASSWORD_TOKEN_EXPIRES_IN
    });

    this.logger.info(
      `Reset password token generated for user with id ${user.id}`
    );

    await sendEmail({
      email: user.email,
      subject: "Password Reset",
      text: "Click the link below to reset your password",
      html: `<a href="${config.CLIENT_URL}/reset-password/${resetToken}">Reset Password</a>`
    });
  }

  async resetPassword(token: string, data: ResetPasswordInput): Promise<void> {
    const decoded = verifyToken(
      token,
      config.RESET_PASSWORD_TOKEN_SECRET!
    ) as JwtPayload;

    const user = await this.getUserById(decoded.id);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const hashedPassword = await hashPassword(data.password);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    this.logger.info(`Password reset for user with id ${user.id}`);
  }

  async logout(userId: string, accessToken: string): Promise<void> {
    if (!accessToken) {
      throw new UnauthorizedException("Unauthorized");
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

    this.logger.info(`User with id ${userId} logged out successfully`);
  }

  async oauthCallback(user: User): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    if (!user) {
      this.logger.error("OAuth callback received no user");
      throw new UnauthorizedException("Unauthorized Access");
    }

    const { accessToken, refreshToken } =
      await this.generateAccessAndRefreshTokens(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    });

    this.logger.info(`OAuth login successful for user: ${user.id}`);

    return { accessToken, refreshToken };
  }
}
