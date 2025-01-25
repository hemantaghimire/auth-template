import nodemailer, {
  Transporter,
  TransportOptions,
  SendMailOptions
} from "nodemailer";
import config from "./config";
import getLogger from "./logger.config";

export interface EmailOptions {
  email: string;
  subject: string;
  message: string;
  html?: string;
}

const logger = getLogger("Nodemailer");

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const transporter: Transporter = nodemailer.createTransport({
      host: config.SMTP_HOST!,
      port: parseInt(config.SMTP_PORT! || "0", 10),
      service: config.SMTP_SERVICE!,
      secure: true,
      auth: {
        user: config.SMTP_EMAIL!,
        pass: config.SMTP_PASSWORD!
      }
    } as TransportOptions);

    const mailOptions: SendMailOptions = {
      from: process.env.SMTP_EMAIL,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${options.email}`);
  } catch (error: Error | any) {
    logger.error(`Email could not be sent. Reason: ${error?.message}`);
    throw new Error("Email could not be sent.");
  }
};
