import { z } from "zod";

const authSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" })
});

const registerSchema = authSchema.extend({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long" })
});

const loginSchema = authSchema;

const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long" })
    .optional(),
  avatar: z.string({ message: "Avatar must be string" }).optional(),
  bio: z
    .string({ message: "Bio must be string" })
    .min(20, {
      message: "Bio must be at least 20 characters long"
    })
    .optional(),
  phone: z
    .string({
      message: "Phone number must be string"
    })
    .length(10, {
      message: "Phone number must be 10 characters long"
    })
    .optional(),
  address: z.string({ message: "Address must be string" }).optional(),
  website: z
    .string({ message: "Website must be string" })
    .url({ message: "Invalid URL" })
    .optional()
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, {
      message: "Current password must be at least 6 characters long"
    }),
    newPassword: z
      .string()
      .min(6, { message: "New password must be at least 6 characters long" }),
    confirmPassword: z.string().min(6, {
      message: "Confirm password must be at least 6 characters long"
    })
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

const deleteAccountSchema = z.object({
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" })
});

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address" })
});

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long" }),
    confirmPassword: z.string().min(6, {
      message: "Confirm password must be at least 6 characters long"
    })
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

const verifyEmailSchema = z.object({
  token: z.string({ message: "Token is required" })
});

export default {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  deleteAccountSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema
};
