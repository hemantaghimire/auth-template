import express from "express";
import AuthController from "../controllers/auth.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateReqBody } from "../../middlewares/schemaValidation.middleware";

import passport from "passport";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updateProfileSchema
} from "../../validators/auth.validator";

const router = express.Router();

router
  .route("/register")
  .post(validateReqBody(registerSchema), AuthController.register);

router.route("/login").post(validateReqBody(loginSchema), AuthController.login);

router
  .route("/me")
  .get(authMiddleware, AuthController.getMe)
  .patch(
    authMiddleware,
    validateReqBody(updateProfileSchema),
    AuthController.updateProfile
  )
  .delete(authMiddleware, AuthController.deleteAccount);

router
  .route("/update-password")
  .post(
    authMiddleware,
    validateReqBody(changePasswordSchema),
    AuthController.updatePassword
  );

router
  .route("/forgot-password")
  .post(validateReqBody(forgotPasswordSchema), AuthController.forgetPassword);

router
  .route("/reset-password/:token")
  .post(validateReqBody(resetPasswordSchema), AuthController.resetPassword);

router
  .route("/refresh-token")
  .post(authMiddleware, AuthController.refreshToken);

router.route("/logout").post(authMiddleware, AuthController.logout);

// OAuth

router.get("/google", passport.authenticate("google"));

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  AuthController.oauthCallback
);

router.get("/github", passport.authenticate("github"));

router.get(
  "/callback/github",
  passport.authenticate("github", { session: false }),
  AuthController.oauthCallback
);

export default router;
