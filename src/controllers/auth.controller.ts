import { NextFunction, Request, Response } from "express";
import AuthService from "../services/auth.service";
import { asyncHandler } from "../helpers/asyncHandler";
import responseFormatter from "../helpers/responseFormatter";
import {
  changePasswordInput,
  forgotPasswordInput,
  loginInput,
  registerInput,
  resetPasswordInput,
  updateProfileInput
} from "../types/types";
import { AppError } from "../helpers/appError";

export class AuthController {
  public static authService: AuthService = new AuthService();

  static readonly getUserId = (req: Request) => {
    if (!req.user || !req.user.id) {
      throw new AppError("User not found", 400);
    }

    return req.user.id;
  };

  static register = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const data = req.body as registerInput;

      await this.authService.register(data);
      responseFormatter(res, 201, "User registered successfully");
    }
  );

  static login = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const data = req.body as loginInput;
      const { accessToken, refreshToken } = await this.authService.login(
        req.body
      );
      responseFormatter(res, 200, "User logged in successfully", {
        accessToken,
        refreshToken
      });
    }
  );

  static getMe = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const id = this.getUserId(req);

      const user = await this.authService.getMe(id);

      responseFormatter(res, 200, "User retrieved successfully", req.user);
    }
  );

  static updateProfile = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const data = req.body as updateProfileInput;

      const id = this.getUserId(req);

      const user = await this.authService.updateProfile(id, data);
      responseFormatter(res, 200, "Profile updated successfully", user);
    }
  );

  static updatePassword = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const id = this.getUserId(req);
      const data = req.body as changePasswordInput;

      await this.authService.updatePassword(id, data);
      responseFormatter(res, 200, "Password updated successfully");
    }
  );

  static refreshToken = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const token = req.body.refreshToken;
      const { accessToken, refreshToken } = await this.authService.refreshToken(
        token
      );

      responseFormatter(res, 200, "Token refreshed successfully", {
        accessToken,
        refreshToken
      });
    }
  );

  static forgetPassword = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const data = req.body as forgotPasswordInput;

      await this.authService.forgetPassword(req.body.email);
      responseFormatter(res, 200, "Password reset link sent to email");
    }
  );

  static resetPassword = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const token = req.params.token;
      const data = req.body as resetPasswordInput;
      await this.authService.resetPassword(token, data);
      responseFormatter(res, 200, "Password reset successfully");
    }
  );

  static deleteAccount = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const id = this.getUserId(req);

      await this.authService.deleteAccount(id);
      responseFormatter(res, 200, "Account deleted successfully");
    }
  );

  static logout = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const id = this.getUserId(req);

      const token = req.headers.authorization?.split(" ")[1];

      await this.authService.logout(id, token!);
      responseFormatter(res, 200, "User logged out successfully");
    }
  );
}

export default AuthController;
