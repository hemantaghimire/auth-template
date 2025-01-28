// you can use send grid also to send emails. You can use the following code snippet to send emails using send grid:

// import sgMail from "@sendgrid/mail";
// import config from "./config";
// import { asyncHandler } from "../helpers/asyncHandler";
// import getLogger from "./logger.config";
// import { InternalServerErrorException } from "../errors/InternalServerErrorException";

// sgMail.setApiKey(config.SENDGRID_API_KEY!);

// const logger = getLogger("SendGrid");

// export const sendEmail = async (options: {
//   email: string;
//   subject: string;
//   text: string;
//   html?: string;
// }) => {
//   const mailOptions = {
//     from: config.SENDGRID_MAIL!,
//     to: options.email,
//     subject: options.subject,
//     text: options.text,
//     html: options.html
//   };

//   try {
//     await sgMail.send(mailOptions);
//     logger.info(`Email sent to ${options.email}`);
//   } catch (error) {
//     logger.error(error);
//     throw new InternalServerErrorException("Email not sent");
//   }
// };
