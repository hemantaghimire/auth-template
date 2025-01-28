import { NextFunction, Request, RequestHandler, Response } from "express";
import { NotFoundException } from "../../errors/NotFoundException";
import { asyncHandler } from "../../helpers/asyncHandler";
import responseFormatter from "../../helpers/responseFormatter";
import {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  UpdateProfileInput
} from "../../validators/auth.validator";
import { AuthService } from "../services/auth.service";
import { User } from "@prisma/client";

export class AuthController {
  public static authService: AuthService = new AuthService();

  static readonly getUserId = (req: Request) => {
    if (!req.user || !req.user.id) {
      throw new NotFoundException("User not found");
    }

    return req.user.id;
  };

  static register: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const data = req.body as RegisterInput;

      await this.authService.register(data);
      return responseFormatter(res, 201, "User registered successfully");
    }
  );

  static login: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const data = req.body as LoginInput;
      const { accessToken, refreshToken } = await this.authService.login(
        req.body
      );
      return responseFormatter(res, 200, "User logged in successfully", {
        accessToken,
        refreshToken
      });
    }
  );

  static getMe: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const id = this.getUserId(req);

      const user = await this.authService.getMe(id);

      return responseFormatter(
        res,
        200,
        "User retrieved successfully",
        req.user
      );
    }
  );

  static updateProfile: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const data = req.body as UpdateProfileInput;

      const id = this.getUserId(req);

      const user = await this.authService.updateProfile(id, data);
      return responseFormatter(res, 200, "Profile updated successfully", user);
    }
  );

  static updatePassword: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const id = this.getUserId(req);
      const data = req.body as ChangePasswordInput;

      await this.authService.updatePassword(id, data);
      return responseFormatter(res, 200, "Password updated successfully");
    }
  );

  static refreshToken: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const token = req.body.refreshToken;
      const { accessToken, refreshToken } = await this.authService.refreshToken(
        token
      );

      return responseFormatter(res, 200, "Token refreshed successfully", {
        accessToken,
        refreshToken
      });
    }
  );

  static forgetPassword: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const data = req.body as ForgotPasswordInput;

      await this.authService.forgetPassword(req.body.email);
      return responseFormatter(res, 200, "Password reset link sent to email");
    }
  );

  static resetPassword: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const token = req.params.token;
      const data = req.body as ResetPasswordInput;
      await this.authService.resetPassword(token, data);
      return responseFormatter(res, 200, "Password reset successfully");
    }
  );

  static deleteAccount: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const id = this.getUserId(req);

      await this.authService.deleteAccount(id);
      return responseFormatter(res, 200, "Account deleted successfully");
    }
  );

  static logout: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const id = this.getUserId(req);

      const token = req.headers.authorization?.split(" ")[1];

      await this.authService.logout(id, token!);
      return responseFormatter(res, 200, "User logged out successfully");
    }
  );

  static oauthCallback = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const user = req.user as User;

      const { accessToken, refreshToken } =
        await this.authService.oauthCallback(user);

      responseFormatter(res, 200, "Successfully logged in", {
        accessToken,
        refreshToken
      });
    }
  );
}

export default AuthController;
