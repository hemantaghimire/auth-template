import express from "express";
import AuthController from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import validateSchema from "../middlewares/schemaValidation.middleware";
import authValidator from "../validators/auth.validator";
import passport from "passport";

const router = express.Router();

router
  .route("/register")
  .post(validateSchema(authValidator.registerSchema), AuthController.register);

router
  .route("/login")
  .post(validateSchema(authValidator.loginSchema), AuthController.login);

router
  .route("/me")
  .get(authMiddleware, AuthController.getMe)
  .patch(
    authMiddleware,
    validateSchema(authValidator.updateProfileSchema),
    AuthController.updateProfile
  )
  .delete(authMiddleware, AuthController.deleteAccount);

router
  .route("/update-password")
  .post(
    authMiddleware,
    validateSchema(authValidator.changePasswordSchema),
    AuthController.updatePassword
  );

router
  .route("/forgot-password")
  .post(
    validateSchema(authValidator.forgotPasswordSchema),
    AuthController.forgetPassword
  );

router
  .route("/reset-password/:token")
  .post(
    validateSchema(authValidator.resetPasswordSchema),
    AuthController.resetPassword
  );

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
