import { z } from "zod";
import authValidator from "../validators/auth.validator";

export type loginInput = z.infer<typeof authValidator.loginSchema>;
export type registerInput = z.infer<typeof authValidator.registerSchema>;
export type updateProfileInput = z.infer<
  typeof authValidator.updateProfileSchema
>;
export type changePasswordInput = z.infer<
  typeof authValidator.changePasswordSchema
>;
export type deleteAccountInput = z.infer<
  typeof authValidator.deleteAccountSchema
>;
export type forgotPasswordInput = z.infer<
  typeof authValidator.forgotPasswordSchema
>;
export type resetPasswordInput = z.infer<
  typeof authValidator.resetPasswordSchema
>;
