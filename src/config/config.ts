import dotenv from "dotenv";

if (process.env.NODE_ENV === "development") {
  dotenv.config({
    path: "./.env"
  });
} else if (process.env.NODE_ENV === "production") {
  dotenv.config({ path: "./.env.production" });
} else if (process.env.NODE_ENV === "test") {
  dotenv.config({ path: "./.env.test" });
}

export default {
  PORT: process.env.PORT || 4000,
  NODE_ENV: process.env.NODE_ENV || "development",
  BASE_URL: process.env.BASE_URL,

  DATABASE_URL: process.env.DATABASE_URL,
  CLIENT_URL: process.env.CLIENT_URL,
  // JWT Credentials for Authentication
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET!,
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN!,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET!,
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN!,

  // JWT Credentials for Email Verification
  RESET_PASSWORD_TOKEN_SECRET: process.env.RESET_PASSWORD_TOKEN_SECRET!,
  RESET_PASSWORD_TOKEN_EXPIRES_IN: process.env.RESET_PASSWORD_TOKEN_EXPIRES_IN!,

  // Nodemailer Credentials
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_SERVICE: process.env.SMTP_SERVICE,
  SMTP_EMAIL: process.env.SMTP_EMAIL,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,

  // SendGrid Credentials
  // SENDGRID_API_KEY: process.env.SENDGRID_API_KEY!,
  // SENDGRID_MAIL: process.env.SENDGRID_MAIL!,

  // OAuth Credentials
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,

  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL
};
